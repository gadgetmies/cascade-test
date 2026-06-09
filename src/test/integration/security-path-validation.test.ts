import test from "../../lib/test.js";
import { spawnSync } from "child_process";
import * as path from "path";
import { assert } from "chai";
import * as fs from "fs";

test({
  "setup": () => {
    // Ensure dist exists for integration tests
    if (!fs.existsSync("dist/bin/run-tests.js")) {
        spawnSync("npm", ["run", "build"]);
    }
    return { timeout: 60000 };
  },
  "Security Path Validation": {
    "should block coverage directory outside CWD": () => {
      const result = spawnSync("node", [
        "dist/bin/run-tests.js",
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        "../unsafe-coverage"
      ], { encoding: "utf-8" });

      assert.include(result.stderr, "Security Error: Coverage directory '../unsafe-coverage' is outside the current working directory.");
      assert.strictEqual(result.status, 1);
    },

    "should block output file outside CWD": () => {
      const result = spawnSync("node", [
        "dist/bin/run-tests.js",
        "src/test/examples",
        "--reporter",
        "json",
        "--output",
        "../unsafe-results.json"
      ], { encoding: "utf-8" });

      assert.include(result.stderr, "Security Error: Output file '../unsafe-results.json' is outside the current working directory.");
      assert.strictEqual(result.status, 1);
    }
  }
});
