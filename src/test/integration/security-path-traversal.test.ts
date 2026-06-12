import { test } from "../../index.js";
import { isPathSafe } from "../../lib/path-utils.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { spawnSync } from "child_process";

test({
  "Security: Path Traversal": {
    "isPathSafe utility": () => {
      const cwd = process.cwd();
      if (!isPathSafe("src", cwd) || isPathSafe("../", cwd) || isPathSafe("/etc/passwd", cwd)) return "isPathSafe failed";
    },
    "CLI blocks unsafe paths": () => {
      const run = (args: string[]) => spawnSync("npx", ["tsx", "src/bin/run-tests.ts", "src/test/examples", ...args], { encoding: "utf8" });
      if (!run(["--coverage", "--coverage-dir", ".."]).stderr.includes("Security Error")) return "Failed .. check";
      if (!run(["--coverage", "--coverage-dir", "."]).stderr.includes("Security Error")) return "Failed CWD check";
    },
    "fixture-utils blocks traversal": () => {
      try { assertFixture("../package.json", {}); return "Should have thrown"; }
      catch (e: any) { if (!e.message.includes("Security Error")) return "Wrong error"; }
    }
  }
});
