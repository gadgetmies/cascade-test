import { test } from "../../index.js";
import { spawnSync } from "child_process";
import { expect } from "chai";

test({
  setup: () => ({ timeout: 60000 }),
  "Security: Path Validation": {
    "should block coverage directory outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--coverage",
        "--coverage-dir",
        "../outside",
      ], { encoding: "utf8" });

      expect(result.stderr).to.contain("Security Error: Coverage directory '../outside' is outside the current working directory.");
      expect(result.status).to.equal(1);
    },

    "should block coverage directory equal to CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--coverage",
        "--coverage-dir",
        ".",
      ], { encoding: "utf8" });

      expect(result.stderr).to.contain("Security Error: Coverage directory cannot be the current working directory.");
      expect(result.status).to.equal(1);
    },

    "should block output path outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--reporter",
        "json",
        "--output",
        "/tmp/unsafe.json",
      ], { encoding: "utf8" });

      expect(result.stderr).to.contain("Security Error: Output path '/tmp/unsafe.json' is outside the current working directory.");
      expect(result.status).to.equal(1);
    },

    "should allow safe paths": () => {
      // Use a glob that matches no files to exit quickly but pass path validation
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--glob",
        "non-existent-file",
        "--coverage",
        "--coverage-dir",
        "safe-coverage-dir",
      ], { encoding: "utf8" });

      // Should NOT contain security error
      expect(result.stderr).to.not.contain("Security Error");
      // It will exit with 1 because no files matched, but that's fine
      expect(result.stderr).to.contain("No test files matched");
    }
  },
});
