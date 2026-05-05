import { test } from "../../index.js";
import { readFixture, createFixture, assertFixture } from "../../lib/fixture-utils.js";
import { spawnSync } from "child_process";

test({
  "Security Boundaries": {
    "Path Traversal": {
      "readFixture should throw on traversal": () => {
        try {
          readFixture("../package.json");
          throw new Error("Should have thrown Security Error");
        } catch (e: any) {
          if (e.message !== "Security Error: Path traversal detected in fixture name") {
            throw e;
          }
        }
      },
      "createFixture should throw on traversal": () => {
        try {
          createFixture("../malicious.json", { evil: true });
          throw new Error("Should have thrown Security Error");
        } catch (e: any) {
          if (e.message !== "Security Error: Path traversal detected in fixture name") {
            throw e;
          }
        }
      },
      "assertFixture should throw on traversal": () => {
        try {
          assertFixture("../package.json", {});
          throw new Error("Should have thrown Security Error");
        } catch (e: any) {
          if (e.message !== "Security Error: Path traversal detected in fixture name") {
            throw e;
          }
        }
      },
      "should throw on absolute paths": () => {
        try {
          readFixture("/etc/passwd");
          throw new Error("Should have thrown Security Error");
        } catch (e: any) {
          if (e.message !== "Security Error: Absolute paths are not allowed for fixtures") {
            throw e;
          }
        }
      }
    },
    "Arbitrary Directory Deletion": {
      "cli should throw error if coverage directory is outside CWD": () => {
        // Run the CLI with a coverage directory that is outside the CWD
        const result = spawnSync("npx", [
          "tsx",
          "src/bin/run-tests.ts",
          "src/test/examples",
          "--coverage",
          "--coverage-dir",
          "../outside-coverage"
        ], { encoding: "utf8" });

        if (!result.stderr.includes("Security Error: Coverage directory must be within the current working directory")) {
          return `Expected security error in stderr, but got: ${result.stderr}`;
        }
        if (result.status !== 1) {
          return `Expected exit status 1, but got: ${result.status}`;
        }
      }
    }
  }
});
