import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as path from "path";

test({
  "Security Path Traversal Tests": {
    "should block coverage directory outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--coverage",
        "--coverage-dir",
        "../unsafe-coverage"
      ], { encoding: "utf8" });

      if (!result.stderr.includes("Security Error: Coverage directory '../unsafe-coverage' is outside the current working directory.")) {
        return `Expected security error in stderr, but got:\n${result.stderr}`;
      }
      if (result.status !== 1) {
        return `Expected exit code 1, but got ${result.status}`;
      }
    },

    "should block output file outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--reporter",
        "json",
        "--output",
        "../unsafe-output.json"
      ], { encoding: "utf8" });

      if (!result.stderr.includes("Security Error: Output path '../unsafe-output.json' is outside the current working directory.")) {
        return `Expected security error in stderr, but got:\n${result.stderr}`;
      }
      if (result.status !== 1) {
        return `Expected exit code 1, but got ${result.status}`;
      }
    },

    "should block CWD as coverage directory": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--coverage",
        "--coverage-dir",
        "."
      ], { encoding: "utf8" });

      if (!result.stderr.includes("Security Error: Cannot use current working directory as coverage directory.")) {
        return `Expected security error in stderr, but got:\n${result.stderr}`;
      }
      if (result.status !== 1) {
        return `Expected exit code 1, but got ${result.status}`;
      }
    }
  }
});
