import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { spawnSync } from "child_process";

test({
  "Security: Path Traversal": {
    "should block directory traversal in assertFixture": () => {
      try {
        assertFixture("../../../etc/passwd", {});
        return "Should have thrown a Security Error";
      } catch (e: any) {
        if (!e.message.includes("Security Error")) return `Unexpected error: ${e.message}`;
      }
    },
    "CLI: should block unsafe paths": () => {
      const run = (args: string[]) => spawnSync(process.execPath, ["--import", "tsx", "src/bin/run-tests.ts", "src/test/integration/fixtures", ...args], { encoding: "utf8" });
      if (!run(["--output", "../evil.json"]).stderr.includes("outside CWD")) return "Output fail";
      if (!run(["--coverage", "--coverage-dir", ".."]).stderr.includes("outside CWD")) return "Coverage fail";
      if (!run(["--coverage", "--coverage-dir", "."]).stderr.includes("Cannot use CWD")) return "CWD fail";
    }
  }
});
