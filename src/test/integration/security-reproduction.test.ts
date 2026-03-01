import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as path from "path";

test({
  'Security Deletion Tests': {
    'should block dangerous coverage directory (..)': () => {
      const runnerPath = path.resolve(process.cwd(), "dist/bin/run-tests.js");
      const testPath = "dist/test/examples";

      const result = spawnSync("node", [
        runnerPath,
        testPath,
        "--coverage",
        "--coverage-dir", ".."
      ], { encoding: 'utf8' });

      if (result.status === 0) {
        return "Runner should have exited with non-zero status for dangerous coverage directory";
      }

      if (!result.stderr.includes("Invalid coverage directory")) {
        return `Expected error message not found in stderr. Got: ${result.stderr}`;
      }
      return;
    },

    'should block dangerous coverage directory (absolute path)': () => {
        const runnerPath = path.resolve(process.cwd(), "dist/bin/run-tests.js");
        const testPath = "dist/test/examples";

        const result = spawnSync("node", [
          runnerPath,
          testPath,
          "--coverage",
          "--coverage-dir", "/tmp/dangerous"
        ], { encoding: 'utf8' });

        if (result.status === 0) {
          return "Runner should have exited with non-zero status for absolute coverage directory";
        }

        if (!result.stderr.includes("Invalid coverage directory")) {
          return `Expected error message not found in stderr. Got: ${result.stderr}`;
        }
        return;
      },

      'should block dangerous coverage directory (CWD)': () => {
        const runnerPath = path.resolve(process.cwd(), "dist/bin/run-tests.js");
        const testPath = "dist/test/examples";

        const result = spawnSync("node", [
          runnerPath,
          testPath,
          "--coverage",
          "--coverage-dir", "."
        ], { encoding: 'utf8' });

        if (result.status === 0) {
          return "Runner should have exited with non-zero status for CWD as coverage directory";
        }

        if (!result.stderr.includes("Invalid coverage directory")) {
          return `Expected error message not found in stderr. Got: ${result.stderr}`;
        }
        return;
      }
  }
});
