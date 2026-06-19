
import { test } from "../../index.js";
import { spawnSync } from "child_process";
test({ "Security Path Traversal": {
  setup: () => ({ b: "src/bin/run-tests.ts", timeout: 30000 }),
  "should block traversal": (c: any) => {
    const run = (a: string[]) => spawnSync("npx", ["tsx", c.b, "src/test/examples", ...a], { encoding: "utf8" });
    if (!run(["--coverage", "--coverage-dir", ".."]).stderr.includes("Security Error")) return "Failed to block coverage-dir traversal";
    if (!run(["--reporter", "json", "--output", ".."]).stderr.includes("Security Error")) return "Failed to block output traversal";
    if (!run(["--coverage", "--coverage-dir", "."]).stderr.includes("Security Error")) return "Failed to block CWD as coverage-dir";
  }
}});
