import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { spawnSync } from "child_process";
import * as path from "path";

test({
  "Security: Path Validation": {
    "CLI: should block unsafe coverage directory": () => {
      const result = spawnSync("npx", [
        "tsx", "src/bin/run-tests.ts", "src/test/examples",
        "--coverage", "--coverage-dir", "../unsafe-coverage"
      ], { encoding: "utf8" });

      if (!result.stderr.includes("Security Error: Coverage directory '../unsafe-coverage' is outside the current working directory.")) {
        return `Expected security error for coverage directory, but got: ${result.stderr}`;
      }
    },

    "CLI: should block unsafe output file": () => {
      const result = spawnSync("npx", [
        "tsx", "src/bin/run-tests.ts", "src/test/examples",
        "--reporter", "json", "--output", "/tmp/unsafe-output.json"
      ], { encoding: "utf8" });

      if (!result.stderr.includes("Security Error: Output file path '/tmp/unsafe-output.json' is outside the current working directory.")) {
        return `Expected security error for output file, but got: ${result.stderr}`;
      }
    },

    "Fixtures: should block traversal in fixture name": () => {
      try {
        assertFixture("../../../package.json", {});
        return "Expected assertFixture to throw for path traversal";
      } catch (e: any) {
        if (!e.message.includes("Security Error: Fixture path '../../../package.json' is outside the intended fixtures directory.")) {
          return `Unexpected error message: ${e.message}`;
        }
      }
    },

    "Fixtures: should block absolute paths": () => {
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
