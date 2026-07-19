#!/usr/bin/env node
import * as R from "ramda";
import {
  recursivelyFindByRegex,
  runnableTestFileAllowlist,
  filterTestPathsByBasenameRegex,
  filterTestPathsByBasenameGlob,
} from "../lib/file-utils.js";
import { fork, spawn, ChildProcess } from "child_process";
import yargsFactory from "yargs/yargs";
import type { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import {
  assertNoUnknownPositionalArgs,
  assertBasenameFilterExclusivity,
  runTestsCliCommandBuilder,
  type RunTestsCliArgv,
} from "../lib/run-tests-cli-builder.js";
import * as path from "path";
import * as fs from "fs";
import { TestSummary } from "../types.js";
import { getDisplayTestFile, isPathSafe } from "../lib/path-utils.js";
import { forkExecArgvForScript } from "../lib/fork-ts-script.js";
import "colors";

interface TestResult {
  test: string;
  code: number;
  output?: string;
}

interface ExecutionFailure {
  test: string;
  output?: string;
}

interface CoverageOptions {
  enabled: boolean;
  reporter: string[];
  directory: string;
  exclude?: string[];
  include?: string[];
  all?: boolean;
  skipFull?: boolean;
}

const runTest = (
  test: string,
  config: {
    reporter?: string;
    outputFile?: string;
    ci?: string;
    testPattern?: string;
    basePath: string;
    coverage?: CoverageOptions;
  }
): Promise<TestResult> => {
  const child: ChildProcess = fork(test, [], {
    execArgv: forkExecArgvForScript(test),
    env: {
      ...process.env,
      CASCADE_TEST_REPORTER: config.reporter || "console",
      CASCADE_TEST_OUTPUT: config.outputFile || "",
      CASCADE_TEST_CI: config.ci || "auto",
      CASCADE_TEST_CASE_REGEX: config.testPattern || "",
      CASCADE_TEST_BASE_PATH: config.basePath,
      NODE_V8_COVERAGE: config.coverage?.enabled ? config.coverage.directory : "",
    },
  });
  let output = "";

  return new Promise<TestResult>(function (
    resolve: (value: TestResult) => void,
    reject: (reason?: Error) => void
  ) {
    child.stdout?.on("data", (data) => {
      output += data.toString();
    });

    child.stderr?.on("data", (data) => {
      output += data.toString();
    });

    child.addListener("error", reject);
    child.addListener("exit", (code) => {
      resolve({ test, code: code || 0, output });
    });
  });
};

const processCoverage = (coverageOptions: CoverageOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    const c8Args = [
      "report",
      ...coverageOptions.reporter.flatMap((r) => ["--reporter", r]),
      "--reports-dir", coverageOptions.directory,
    ];

    if (coverageOptions.exclude) {
      coverageOptions.exclude.forEach(pattern => {
        c8Args.push("--exclude", pattern);
      });
    }

    if (coverageOptions.include) {
      coverageOptions.include.forEach(pattern => {
        c8Args.push("--include", pattern);
      });
    }

    if (coverageOptions.all) {
      c8Args.push("--all");
    }

    if (coverageOptions.skipFull) {
      c8Args.push("--skip-full");
    }

    const c8Path = path.join(process.cwd(), "node_modules", ".bin", "c8");
    const c8Process = spawn(c8Path, c8Args, {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_V8_COVERAGE: coverageOptions.directory,
      },
    });

    c8Process.on("error", reject);
    c8Process.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`c8 process exited with code ${code}`));
      }
    });
  });
};

type BasenameFilter =
  | { kind: "regex"; re: RegExp }
  | { kind: "glob"; pattern: string };

const main = async (
  testPath: string,
  basenameFilter: BasenameFilter | undefined,
  config: {
    reporter?: string;
    outputFile?: string;
    ci?: string;
    testPattern?: string;
    coverage?: CoverageOptions;
  } = {}
): Promise<void> => {
  if (config.outputFile && !isPathSafe(process.cwd(), config.outputFile)) {
    console.error(`Security Error: Output path '${config.outputFile}' is outside CWD.`);
    process.exit(1);
  }
  if (config.coverage?.enabled) {
    const covDir = config.coverage.directory || "coverage";
    if (path.resolve(covDir) === process.cwd()) {
      console.error("Security Error: Cannot use CWD as coverage directory.");
      process.exit(1);
    }
    if (!isPathSafe(process.cwd(), covDir)) {
      console.error(`Security Error: Coverage directory '${covDir}' is outside CWD.`);
      process.exit(1);
    }
  }
  const resolvedTestPath = path.resolve(`${process.cwd()}/${testPath}`);
  const candidates = recursivelyFindByRegex(
    resolvedTestPath,
    runnableTestFileAllowlist
  );
  const testFiles =
    basenameFilter === undefined
      ? candidates
      : basenameFilter.kind === "regex"
        ? filterTestPathsByBasenameRegex(candidates, basenameFilter.re)
        : filterTestPathsByBasenameGlob(candidates, basenameFilter.pattern);

  if (basenameFilter !== undefined && testFiles.length === 0) {
    console.error(
      "No test files matched the given --regex / --glob filter.".red
    );
    process.exit(1);
  }

  const exitStatuses: TestResult[] = [];
  const allTestSummaries: TestSummary[] = [];

  if (config.coverage?.enabled) {
    console.log("\nCode coverage enabled".green);
    console.log(`Coverage directory: ${config.coverage.directory}`.yellow);
    console.log(`Coverage reporters: ${config.coverage.reporter.join(", ")}`.yellow);
    
    if (fs.existsSync(config.coverage.directory)) {
      fs.rmSync(config.coverage.directory, { recursive: true, force: true });
    }
    fs.mkdirSync(config.coverage.directory, { recursive: true });
  }

  console.log("Found test files matching criteria:\n");
  console.log(
    testFiles.map((f) => getDisplayTestFile(f, resolvedTestPath)).join("\n")
  );
  console.log("\n");

  for (const test of testFiles) {
    try {
      const result = await runTest(test, {
        basePath: resolvedTestPath,
        ...config,
      });
      exitStatuses.push(result);

      // Try to read test summary from temporary file
      const tempFile = path.join(process.cwd(), ".cascade-test-results.json");
      try {
        if (fs.existsSync(tempFile)) {
          const testSummary = JSON.parse(
            fs.readFileSync(tempFile, "utf8")
          ) as TestSummary;
          allTestSummaries.push(testSummary);
          // Clean up the temporary file
          fs.unlinkSync(tempFile);
        }
      } catch (e) {
        // Ignore file read errors
      }
    } catch (e) {
      console.error(`${test} execution failed!`, e);
      exitStatuses.push({ test, code: -1 });
    }
  }

  // Calculate overall statistics
  const totalTests = allTestSummaries.reduce(
    (sum, summary) => sum + summary.total,
    0
  );
  const totalPassed = allTestSummaries.reduce(
    (sum, summary) => sum + summary.passed,
    0
  );
  const totalFailed = allTestSummaries.reduce(
    (sum, summary) => sum + summary.failed,
    0
  );
  const totalSkipped = allTestSummaries.reduce(
    (sum, summary) => sum + summary.skipped,
    0
  );
  const allFailedTests = allTestSummaries.flatMap(
    (summary) => summary.failedTests
  );
  if (config.testPattern && totalTests === 0) {
    console.error(
      `No test cases matched --test=${config.testPattern}`.red
    );
    process.exit(1);
  }

  const failedTests = R.reject(R.propEq(0, "code"), exitStatuses);
  const testSummariesByFile = new Map(
    allTestSummaries.map((summary) => [summary.testFile, summary])
  );
  const executionFailures: ExecutionFailure[] = failedTests
    .filter(({ test }) => !testSummariesByFile.has(getDisplayTestFile(test, resolvedTestPath)))
    .map(({ test, output }) => ({ test, output }));
  const failedCasesCount = allFailedTests.length;
  const totalFailedIncludingExecution = totalFailed + executionFailures.length;

  if (failedTests.length !== 0) {
    console.log("\n" + "=".repeat(60).red);
    if (failedCasesCount > 0) {
      console.log(`${failedCasesCount} FAILED TEST CASES`.red.bold);
    }
    if (executionFailures.length > 0) {
      console.log(`${executionFailures.length} TEST FILE EXECUTION ERROR(S)`.red.bold);
    }
    console.log("=".repeat(60).red);

    for (const { testFile, failedTests } of allTestSummaries) {
      if (failedTests.length === 0) {
        continue;
      }

      console.log(`\n${testFile}`.red.bold);
      console.log("─".repeat(60).red);

      for (const failedTest of failedTests) {
        console.log(`  • ${failedTest.path.slice(1).join(" → ")}`.red);
        if (failedTest.file) {
          const location = failedTest.line ? `${failedTest.file}:${failedTest.line}` : failedTest.file;
          console.log(`    Location: ${location}`.cyan);
        }
        console.log(`    Reason: ${failedTest.error}`.yellow);
      }
    }

    if (executionFailures.length > 0) {
      console.log("\nTest file execution errors:".red.bold);
      console.log("─".repeat(60).red);
      for (const { test, output } of executionFailures) {
        console.log(`  • ${getDisplayTestFile(test, resolvedTestPath)}`.red);
        if (output && output.trim()) {
          console.log(`    Output: ${output.trim()}`.yellow);
        }
      }
    }

    console.log("\n" + "=".repeat(60).red);

    printTestSummary();

    if (config.coverage?.enabled) {
      console.log("\nProcessing coverage data...".yellow);
      try {
        await processCoverage(config.coverage);
        console.log("\nCoverage report generated successfully!".green);
      } catch (error) {
        console.error("\nFailed to generate coverage report:".red, error);
      }
    }

    process.exit(1);
  }

  printTestSummary();

  if (config.coverage?.enabled) {
    console.log("\nProcessing coverage data...".yellow);
    try {
      await processCoverage(config.coverage);
      console.log("\nCoverage report generated successfully!".green);
    } catch (error) {
      console.error("\nFailed to generate coverage report:".red, error);
    }
  }

  console.log("\nAll tests passed!".green);
  process.exit(0);

  function printTestSummary() {
    console.log(`\nTest Summary:`.bold);
    console.log(`  Total: ${totalTests}`);
    console.log(`  Passed: ${totalPassed}`.green);
    console.log(`  Failed: ${totalFailedIncludingExecution}`.red);
    console.log(`  Skipped: ${totalSkipped}`.yellow);
  }
};

const cli = yargsFactory(hideBin(process.argv)) as Argv;

cli
  .usage("Usage: $0 <path> [options]")
  .command<RunTestsCliArgv>(
    "$0 <path>",
    "Runs tests in path filtered by regex if given",
    runTestsCliCommandBuilder,
    (argv: RunTestsCliArgv) => {
      try {
        assertNoUnknownPositionalArgs(argv);
        assertBasenameFilterExclusivity(argv);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(msg);
        process.exit(1);
      }
      const coverageConfig: CoverageOptions | undefined = argv.coverage
        ? {
            enabled: true,
            reporter: argv.coverageReporter as string[] || ["text", "html"],
            directory: argv.coverageDir || "coverage",
            exclude: argv.coverageExclude as string[] | undefined,
            include: argv.coverageInclude as string[] | undefined,
            all: argv.coverageAll,
            skipFull: argv.coverageSkipFull,
          }
        : undefined;

      let basenameFilter: BasenameFilter | undefined;
      if (argv.regex !== undefined) {
        basenameFilter = { kind: "regex", re: new RegExp(argv.regex) };
      } else if (argv.glob !== undefined) {
        basenameFilter = { kind: "glob", pattern: argv.glob };
      }

      return main(argv.path, basenameFilter, {
        reporter: argv.reporter as any,
        outputFile: argv.output,
        ci: argv.ci === "auto" ? undefined : (argv.ci as any),
        testPattern: argv.test,
        coverage: coverageConfig,
      });
    }
  )
  .strict()
  .help()
  .alias("help", "h").argv;
