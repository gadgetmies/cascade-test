import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { spawnSync } from "child_process";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const runTestsPath = path.resolve(__dirname, "../../bin/run-tests.ts");

test({
  "Security Path Validation": {
    timeout: 30000,
    "should block coverage directory outside CWD": () => {
      const result = spawnSync("npx", ["tsx", runTestsPath, "src/test/examples", "--coverage", "--coverage-dir", "../unsafe-coverage"], { encoding: "utf8" });
      if (!result.stderr.includes("Security Error")) {
        return "Expected security error for unsafe coverage directory, but it was not found.";
      }
    },

    "should block output file outside CWD": () => {
      const result = spawnSync("npx", ["tsx", runTestsPath, "src/test/examples", "--reporter", "json", "--output", "../unsafe-results.json"], { encoding: "utf8" });
      if (!result.stderr.includes("Security Error")) {
        return "Expected security error for unsafe output file, but it was not found.";
      }
    },

    "should block coverage directory pointing to CWD": () => {
      const result = spawnSync("npx", ["tsx", runTestsPath, "src/test/examples", "--coverage", "--coverage-dir", "."], { encoding: "utf8" });
      if (!result.stderr.includes("Security Error")) {
        return "Expected security error for coverage directory pointing to CWD, but it was not found.";
      }
    },

    "should block path traversal in fixture names": () => {
      try {
        assertFixture("../../../etc/passwd", {});
        return "Expected error for path traversal in fixture name, but none was thrown.";
      } catch (e: any) {
        if (!e.message.includes("Security Error")) {
          return `Expected security error, but got: ${e.message}`;
        }
      }
    }
  }
});
