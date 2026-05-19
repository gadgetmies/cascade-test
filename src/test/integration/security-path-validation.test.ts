import test from "../../lib/test.js";
import { readFixture } from "../../lib/fixture-utils.js";
import { spawnSync } from "child_process";

test({
  "Path Validation Security": {
    "should reject coverage directory outside CWD": () => {
      const { stderr } = spawnSync("tsx", ["src/bin/run-tests.ts", "src/test/examples", "--coverage", "--coverage-dir", "../unsafe"], { encoding: "utf8" });
      if (!stderr.includes("Security Error: Coverage directory")) return "Missing security error";
    },
    "should reject fixture path traversal": () => {
      try { readFixture("../../../package.json"); return "Should have thrown"; }
      catch (e: any) { if (!e.message.includes("Security Error")) return "Unexpected error: " + e.message; }
    }
  }
});
