import test from "../../lib/test.js";
import { spawnSync } from "child_process";
import { expect } from "chai";
import * as path from "path";

export default test({
  setup: () => ({ timeout: 60000 }),
  "Security Path Validation": {
    "should block coverage directory outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        "/tmp/unsafe-coverage"
      ], { encoding: "utf8" });

      expect(result.stderr).to.contain("Security Error: Coverage directory '/tmp/unsafe-coverage' is outside the current working directory.");
      expect(result.status).to.equal(1);
    },

    "should block coverage directory equal to CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        "."
      ], { encoding: "utf8" });

      expect(result.stderr).to.contain("Security Error: Cannot use current working directory as coverage directory.");
      expect(result.status).to.equal(1);
    },

    "should block output file outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--reporter",
        "json",
        "--output",
        "../unsafe-output.json"
      ], { encoding: "utf8" });

      expect(result.stderr).to.contain("Security Error: Output path '../unsafe-output.json' is outside the current working directory.");
      expect(result.status).to.equal(1);
    }
  }
});
