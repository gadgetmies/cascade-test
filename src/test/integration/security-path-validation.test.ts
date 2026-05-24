import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as path from "path";
import { expect } from "chai";
import { assertFixture } from "../../lib/fixture-utils.js";

test({
  "Security: Path Validation": {
    setup: () => {
      return {
        binPath: "src/bin/run-tests.ts"
      };
    },

    "should block coverage directory outside CWD": ({ binPath }) => {
      const result = spawnSync("npx", [
        "tsx",
        binPath,
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        "../unsafe-coverage"
      ], { encoding: "utf8" });

      expect(result.stderr).to.contain("Security Error: Coverage directory '../unsafe-coverage' is outside the current working directory or points to it.");
      expect(result.status).to.equal(1);
      return null;
    },

    "should block output path outside CWD": ({ binPath }) => {
      const result = spawnSync("npx", [
        "tsx",
        binPath,
        "src/test/examples",
        "--reporter",
        "json",
        "--output",
        "../unsafe-results.json"
      ], { encoding: "utf8" });

      expect(result.stderr).to.contain("Security Error: Output path '../unsafe-results.json' is outside the current working directory or points to it.");
      expect(result.status).to.equal(1);
      return null;
    },

    "should block coverage directory pointing to CWD": ({ binPath }) => {
      const result = spawnSync("npx", [
        "tsx",
        binPath,
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        "."
      ], { encoding: "utf8" });

      expect(result.stderr).to.contain("Security Error: Coverage directory '.' is outside the current working directory or points to it.");
      expect(result.status).to.equal(1);
      return null;
    },

    "Fixture Security": {
        "should block traversal in assertFixture": () => {
            try {
                assertFixture("../traversal.json", {});
                return "Should have thrown";
            } catch (e: any) {
                expect(e.message).to.contain("Security Error: Fixture path '../traversal.json' is invalid or outside the fixtures directory.");
            }
            return null;
        }
    }
  }
});
