import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { assertFixture } from "../../lib/fixture-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../../");

test({
  "Security Path Validation": {
    "CLI: should block coverage directory outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration/subfolder",
        "--coverage",
        "--coverage-dir",
        "../unsafe-coverage"
      ], {
        cwd: rootDir,
        encoding: "utf8",
      });

      if (!result.stderr.includes("Security Error: Coverage directory '../unsafe-coverage' is outside the current working directory or points to it.")) {
        return `Expected security error for coverage directory, but got: ${result.stderr}`;
      }
      if (result.status !== 1) {
        return `Expected exit code 1, but got ${result.status}`;
      }
    },

    "CLI: should block coverage directory as CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration/subfolder",
        "--coverage",
        "--coverage-dir",
        "."
      ], {
        cwd: rootDir,
        encoding: "utf8",
      });

      if (!result.stderr.includes("Security Error: Coverage directory '.' is outside the current working directory or points to it.")) {
        return `Expected security error for coverage directory as '.', but got: ${result.stderr}`;
      }
      if (result.status !== 1) {
        return `Expected exit code 1, but got ${result.status}`;
      }
    },

    "CLI: should block output file outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration/subfolder",
        "--reporter",
        "json",
        "--output",
        "../unsafe-output.json"
      ], {
        cwd: rootDir,
        encoding: "utf8",
      });

      if (!result.stderr.includes("Security Error: Output file '../unsafe-output.json' is outside the current working directory or points to it.")) {
        return `Expected security error for output file, but got: ${result.stderr}`;
      }
      if (result.status !== 1) {
        return `Expected exit code 1, but got ${result.status}`;
      }
    },

    "Fixtures: should block path traversal in fixture name": () => {
      try {
        assertFixture("../../../package.json", {});
        return "Should have thrown a security error for path traversal in fixture name";
      } catch (error: any) {
        if (!error.message.includes("Security Error: Fixture path '../../../package.json' is outside the fixtures directory.")) {
          return `Expected security error for fixture path traversal, but got: ${error.message}`;
        }
      }
    },

    "Fixtures: should block fixture name as fixtures directory itself": () => {
        try {
          // Attempting to use empty string or "." as fixture name might resolve to the fixtures dir itself
          assertFixture(".", {});
          return "Should have thrown a security error for fixture name as '.'";
        } catch (error: any) {
          if (!error.message.includes("Security Error: Fixture path '.' is outside the fixtures directory.")) {
            return `Expected security error for fixture name as '.', but got: ${error.message}`;
          }
        }
      }
  },
});
