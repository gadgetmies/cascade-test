import { test } from "../../index.js";
import { spawnSync } from "child_process";
import { assertFixture } from "../../lib/fixture-utils.js";

test({
  "Security Tests": {
    "should block path traversal": () => {
      const run = (args: string[]) => spawnSync("npx", ["tsx", "src/bin/run-tests.ts", "src/test/examples", ...args], { encoding: "utf8" });
      if (!run(["--coverage", "--coverage-dir", "../u"]).stderr.includes("Security Error")) return "Failed to block coverage-dir";
      if (!run(["--reporter", "json", "--output", "../u.json"]).stderr.includes("Security Error")) return "Failed to block output";
      try {
        assertFixture("../../../package.json", {});
        return "Expected assertFixture to throw";
      } catch (e: any) {
        if (!e.message.includes("Security Error")) return `Wrong error: ${e.message}`;
      }
    }
  }
});
