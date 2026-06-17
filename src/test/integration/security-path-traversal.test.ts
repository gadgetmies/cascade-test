import { test } from "../../index.js";
import { spawnSync } from "child_process";
import { assertFixture } from "../../lib/fixture-utils.js";

test({
  setup: () => ({ timeout: 60000 }),
  "Security Path Traversal Tests": {
    "CLI: should block coverage directory outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        "../unsafe-coverage",
      ], { encoding: "utf8" });

      if (!result.stderr.includes("Security Error: Coverage directory '../unsafe-coverage' is outside the current working directory.")) {
        return `Expected security error for coverage-dir, but got: ${result.stderr}`;
      }
    },

    "CLI: should block output path outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--reporter",
        "json",
        "--output",
        "../unsafe-results.json",
      ], { encoding: "utf8" });

      if (!result.stderr.includes("Security Error: Output path '../unsafe-results.json' is outside the current working directory.")) {
        return `Expected security error for output, but got: ${result.stderr}`;
      }
    },

    "CLI: should block using CWD as coverage directory": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        ".",
      ], { encoding: "utf8" });

      if (!result.stderr.includes("Security Error: Cannot use current working directory as coverage directory.")) {
        return `Expected security error for CWD coverage-dir, but got: ${result.stderr}`;
      }
    },

    "FixtureUtils: should block traversal via fixture name": () => {
      try {
        assertFixture("../../../package.json", {});
        return "Expected assertFixture to throw for traversal path";
      } catch (e: any) {
        if (!e.message.includes("Security Error: Fixture path '../../../package.json' is outside the fixtures directory.")) {
          return `Unexpected error message: ${e.message}`;
        }
      }
    },

    "FixtureUtils: should block absolute paths for fixture names": () => {
      try {
        assertFixture("/etc/passwd", {});
        return "Expected assertFixture to throw for absolute path";
      } catch (e: any) {
        if (!e.message.includes("Security Error: Absolute paths are not allowed for fixture names: /etc/passwd")) {
          return `Unexpected error message: ${e.message}`;
        }
      }
    }
  }
});
