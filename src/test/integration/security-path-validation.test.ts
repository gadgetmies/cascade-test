import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

test({
  "Security Path Validation": {
    "should block unsafe coverage directory": () => {
      try {
        execSync("node dist/bin/run-tests.js src/test/examples --coverage --coverage-dir ../unsafe-coverage", { stdio: "pipe" });
        return "Should have failed but succeeded";
      } catch (e: any) {
        const output = e.stderr.toString();
        if (!output.includes("Security Error: Coverage directory '../unsafe-coverage' is outside the current working directory")) {
          return `Expected security error, got: ${output}`;
        }
      }
    },

    "should block unsafe output file": () => {
      try {
        execSync("node dist/bin/run-tests.js src/test/examples --reporter json --output ../unsafe-output.json", { stdio: "pipe" });
        return "Should have failed but succeeded";
      } catch (e: any) {
        const output = e.stderr.toString();
        if (!output.includes("Security Error: Output file '../unsafe-output.json' is outside the current working directory")) {
          return `Expected security error, got: ${output}`;
        }
      }
    },

    "should block traversing fixture paths": () => {
      try {
        assertFixture("../unsafe-fixture.json", { test: "data" });
        return "Should have failed but succeeded";
      } catch (e: any) {
        if (!e.message.includes("Security Error: Fixture path '../unsafe-fixture.json' traverses outside the fixtures directory.")) {
          return `Expected security error, got: ${e.message}`;
        }
      }
    }
  }
});
