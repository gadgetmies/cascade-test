import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { execSync } from "child_process";

test({
  "Security Path Validation": {
    "should block unsafe paths": () => {
      const run = (args: string) => execSync(`npx tsx src/bin/run-tests.ts src/test/examples ${args}`, { stdio: "pipe" });
      try {
        run("--coverage --coverage-dir ../unsafe");
        return "Coverage dir not blocked";
      } catch (e: any) {
        if (!e.stderr.toString().includes("Security Error")) return "Wrong coverage error";
      }
      try {
        run("--reporter json --output ../unsafe.json");
        return "Output file not blocked";
      } catch (e: any) {
        if (!e.stderr.toString().includes("Security Error")) return "Wrong output error";
      }
      try {
        assertFixture("../unsafe.json", {});
        return "Fixture path not blocked";
      } catch (e: any) {
        if (!e.message.includes("Security Error")) return "Wrong fixture error";
      }
    }
  }
});
