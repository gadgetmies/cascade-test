import { spawnSync } from "child_process";
import * as path from "path";
import { test } from "../../index.js";
import "colors";

export default test({
  "Security: Deletion Protection": {
    "should block attempt to use parent directory as coverage-dir": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        "..",
      ], { encoding: "utf8" });

      if (
        !result.stderr.includes(
          'Error: Invalid coverage directory "..". It must be a safe subdirectory within the current working directory.'
        )
      ) {
        return `Expected security error message not found in stderr. Stderr: ${result.stderr}`;
      }

      if (result.status !== 1) {
          return `Expected exit code 1, got ${result.status}`;
      }
    },

    "should block attempt to use current directory as coverage-dir": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        ".",
      ], { encoding: "utf8" });

      if (
        !result.stderr.includes(
          'Error: Invalid coverage directory ".". It must be a safe subdirectory within the current working directory.'
        )
      ) {
        return `Expected security error message not found in stderr. Stderr: ${result.stderr}`;
      }

      if (result.status !== 1) {
          return `Expected exit code 1, got ${result.status}`;
      }
    },

    "should block attempt to use absolute path as coverage-dir": () => {
      const absolutePath = path.resolve("/tmp/malicious-coverage");
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        absolutePath,
      ], { encoding: "utf8" });

      if (
        !result.stderr.includes(
          `Error: Invalid coverage directory "${absolutePath}". It must be a safe subdirectory within the current working directory.`
        )
      ) {
        return `Expected security error message not found in stderr. Stderr: ${result.stderr}`;
      }

      if (result.status !== 1) {
          return `Expected exit code 1, got ${result.status}`;
      }
    },
  },
});
