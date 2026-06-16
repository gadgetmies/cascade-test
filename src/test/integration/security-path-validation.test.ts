import { spawnSync } from "child_process";
import { expect } from "chai";
import test from "../../lib/test.js";

test({
  "Security Path Validation": {
    setup: () => ({ timeout: 60000 }),
    "should block coverage directory outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration/fixtures",
        "--coverage",
        "--coverage-dir",
        "../unsafe-coverage",
      ], { encoding: "utf8" });

      expect(result.stderr).to.contain("Security Error: Coverage directory '../unsafe-coverage' is outside the current working directory.");
      expect(result.status).to.equal(1);
    },
    "should block output path outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration/fixtures",
        "--reporter",
        "json",
        "--output",
        "../unsafe-output.json",
      ], { encoding: "utf8" });

      expect(result.stderr).to.contain("Security Error: Output path '../unsafe-output.json' is outside the current working directory.");
      expect(result.status).to.equal(1);
    },
    "should block CWD as coverage directory": () => {
        const result = spawnSync("npx", [
          "tsx",
          "src/bin/run-tests.ts",
          "src/test/integration/fixtures",
          "--coverage",
          "--coverage-dir",
          ".",
        ], { encoding: "utf8" });

        expect(result.stderr).to.contain("Security Error: Cannot use current working directory as coverage directory.");
        expect(result.status).to.equal(1);
      },
  },
});
