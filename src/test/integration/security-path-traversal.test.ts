import test from "../../lib/test.js";
import { spawnSync } from "child_process";
import * as path from "path";
import "colors";

export default test({
  setup: () => ({ timeout: 60000 }),
  "Security: Path Traversal Prevention": {
    "should block output path outside CWD": () => {
      const result = spawnSync(process.execPath, [
        "--import",
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--output",
        "../traversal-test.xml",
      ]);

      const stderr = result.stderr.toString();
      if (!stderr.includes("Security Error: Output path '../traversal-test.xml' is outside the current working directory.")) {
        return `Expected security error for output path, but got: ${stderr}`;
      }
    },

    "should block coverage directory outside CWD": () => {
      const result = spawnSync(process.execPath, [
        "--import",
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--coverage",
        "--coverage-dir",
        "../traversal-coverage",
      ]);

      const stderr = result.stderr.toString();
      if (!stderr.includes("Security Error: Coverage directory '../traversal-coverage' is outside the current working directory.")) {
        return `Expected security error for coverage directory, but got: ${stderr}`;
      }
    },

    "should block coverage directory being CWD": () => {
      const result = spawnSync(process.execPath, [
        "--import",
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--coverage",
        "--coverage-dir",
        ".",
      ]);

      const stderr = result.stderr.toString();
      if (!stderr.includes("Security Error: Cannot use current working directory as coverage directory.")) {
        return `Expected security error for coverage directory being CWD, but got: ${stderr}`;
      }
    },
  },
});
