import { fork, ChildProcess } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as crypto from "crypto";

export interface TestRunResult {
  code: number;
  output: string;
  summary?: any; // Using any to avoid import issues
  reporterOutput?: string;
}

/**
 * Runs a test file using the cascade-test framework and returns the results
 * @param testFilePath - Path to the test file to run
 * @param reporter - Optional reporter type (defaults to 'console')
 * @param outputFile - Optional output file path for reporter output
 * @returns Promise with test run results
 */
export const runTestFile = (
  testFilePath: string,
  reporter?: string,
  outputFile?: string
): Promise<TestRunResult> => {
  const resultsFile = path.join(
    os.tmpdir(),
    `cascade-test-results-${crypto.randomBytes(8).toString("hex")}.json`
  );

  return new Promise((resolve, reject) => {
    const child: ChildProcess = fork(testFilePath, [], {
      env: {
        ...process.env,
        CASCADE_TEST_REPORTER: reporter || "console",
        CASCADE_TEST_OUTPUT: outputFile || "",
        CASCADE_TEST_CI: "console",
        CASCADE_TEST_RESULTS_FILE: resultsFile,
      },
      silent: true,
    });

    let output = "";

    child.stdout?.on("data", (data) => {
      output += data.toString();
    });

    child.stderr?.on("data", (data) => {
      output += data.toString();
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      let summary;
      let reporterOutput;

      if (fs.existsSync(resultsFile)) {
        summary = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
        fs.unlinkSync(resultsFile);
      }

      if (outputFile) {
        if (fs.existsSync(outputFile)) {
          reporterOutput = fs.readFileSync(outputFile, "utf8");
          fs.unlinkSync(outputFile);
        }
      } else {
        // For reporters that output to stdout (like JSON), extract the reporter output from stdout
        // The reporter output is typically the last line of output before the test summary
        const lines = output.split('\n');
        const testSummaryIndex = lines.findIndex(line => line.includes('finished successfully') || line.includes('finished with'));
        if (testSummaryIndex > 0) {
          // Get the line before the test summary, which should be the reporter output
          const potentialReporterOutput = lines[testSummaryIndex - 1].trim();
          if (potentialReporterOutput && (potentialReporterOutput.startsWith('{') || potentialReporterOutput.startsWith('TAP'))) {
            reporterOutput = potentialReporterOutput;
          }
        }
      }

      resolve({
        code: code || 0,
        output,
        summary,
        reporterOutput,
      });
    });
  });
};
