import yargsFactory from "yargs/yargs";
import type { Argv, ArgumentsCamelCase } from "yargs";

export type RunTestsCliArgv = ArgumentsCamelCase<{
  path: string;
  regex?: string;
  glob?: string;
  reporter?: string;
  output?: string;
  ci?: string;
  coverage?: boolean;
  coverageDir?: string;
  coverageReporter?: string[];
  coverageExclude?: string[];
  coverageInclude?: string[];
  coverageAll?: boolean;
  coverageSkipFull?: boolean;
}>;

export function assertNoUnknownPositionalArgs(argv: {
  _?: (string | number)[];
}): void {
  const extra = argv._ ?? [];
  if (extra.length > 0) {
    const list = extra.map(String).join(", ");
    throw new Error(`Unknown argument(s): ${list}`);
  }
}

export function assertStemFilterExclusivity(argv: {
  regex?: string;
  glob?: string;
}): void {
  if (argv.regex !== undefined && argv.glob !== undefined) {
    throw new Error("Cannot use both --regex and --glob");
  }
}

export function runTestsCliCommandBuilder(y: Argv<Record<string, unknown>>): Argv {
  return y
    .positional("path", {
      description: "Path to test files. Searched recursively.",
      type: "string",
      demandOption: true,
    })
    .option("regex", {
      description:
        "Regex matched against each file basename with .js/.ts stripped (e.g. dist/foo.test.js uses stem foo.test). Discovery still excludes .d.ts and .js.map. Incompatible with --glob.",
      alias: "r",
      type: "string",
    })
    .option("glob", {
      description:
        "Shell-style glob matched against the same basename stem as --regex; a trailing .js/.ts/.d.ts on the pattern is ignored. Incompatible with --regex.",
      alias: "G",
      type: "string",
    })
    .option("reporter", {
      description: "Test reporter to use",
      type: "string",
      choices: ["console", "junit", "tap", "json", "mocha-json"],
      default: "console",
    })
    .option("output", {
      description: "Output file for structured reporters",
      alias: "o",
      type: "string",
    })
    .option("ci", {
      description: "CI environment for annotations",
      type: "string",
      choices: ["jenkins", "azure", "gitlab", "github", "console", "auto"],
      default: "auto",
    })
    .option("coverage", {
      description: "Enable code coverage collection",
      type: "boolean",
      default: false,
    })
    .option("coverage-dir", {
      description: "Directory for coverage output",
      type: "string",
      default: "coverage",
    })
    .option("coverage-reporter", {
      description: "Coverage reporters to use",
      type: "array",
      default: ["text", "html"],
    })
    .option("coverage-exclude", {
      description: "Patterns to exclude from coverage",
      type: "array",
    })
    .option("coverage-include", {
      description: "Patterns to include in coverage",
      type: "array",
    })
    .option("coverage-all", {
      description: "Include all files in coverage (even uncovered)",
      type: "boolean",
      default: false,
    })
    .option("coverage-skip-full", {
      description: "Skip files with 100% coverage in reports",
      type: "boolean",
      default: false,
    });
}

export function parseRunTestsCliArgs(argv: string[]): RunTestsCliArgv {
  const parsed = yargsFactory(argv)
    .usage("Usage: $0 <path> [options]")
    .command(
      "$0 <path>",
      "Runs tests in path filtered by regex if given",
      runTestsCliCommandBuilder,
      () => undefined
    )
    .strict()
    .help()
    .showHelpOnFail(false)
    .exitProcess(false)
    .parseSync();

  assertNoUnknownPositionalArgs(parsed);
  assertStemFilterExclusivity(parsed as Pick<RunTestsCliArgv, "regex" | "glob">);
  return parsed as RunTestsCliArgv;
}
