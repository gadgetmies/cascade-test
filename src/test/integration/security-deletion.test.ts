import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { expect } from "chai";

test({
  "Security: Arbitrary Directory Deletion": {
    "should reject coverage-dir outside of CWD": () => {
      // Use a path that is clearly outside CWD but accessible for mkdir if possible,
      // or just trust that any '..' or absolute path should be rejected.
      // Since we are in a sandbox, we might not have many places to write.

      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--regex",
        "fixture-utils.test.ts",
        "--coverage",
        "--coverage-dir",
        "../../tmp/unsafe-coverage"
      ], { encoding: "utf8" });

      expect(result.status).to.equal(1, "Should exit with error code 1");
      expect(result.stderr).to.include("Security Error: coverage-dir must be a subdirectory of the current working directory");
    },

    "should reject coverage-dir being the CWD itself": () => {
        const result = spawnSync("npx", [
            "tsx",
            "src/bin/run-tests.ts",
            "src/test/integration",
            "--regex",
            "fixture-utils.test.ts",
            "--coverage",
            "--coverage-dir",
            "."
        ], { encoding: "utf8" });

        expect(result.status).to.equal(1, "Should exit with error code 1");
        expect(result.stderr).to.include("Security Error: coverage-dir cannot be the current working directory");
    }
  }
});
