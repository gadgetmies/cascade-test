import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { spawnSync } from "child_process";
test({ "Security": {
  "path traversal": () => {
    const run = (args: string[]) => spawnSync("npx", ["tsx", "src/bin/run-tests.ts", "src/test/integration", ...args], { encoding: "utf8" }).stderr;
    if (!run(["--coverage", "--coverage-dir", ".."]).includes("Security Error")) return "traversal";
    if (!run(["--coverage", "--coverage-dir", "."]).includes("Security Error")) return "cwd";
    if (!run(["--output", "/tmp/x"]).includes("Security Error")) return "output";
    try { assertFixture("..", {}); } catch (e: any) { if (e.message.includes("Security Error")) return; }
    return "fixture";
  }
}});
