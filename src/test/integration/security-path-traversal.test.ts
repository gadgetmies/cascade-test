import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { spawnSync } from "child_process";
import * as path from "path";

test({
  "Path Traversal Security": {
    "CLI: should block unsafe coverage directory": () => {
      const result = spawnSync("tsx", [
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--coverage",
        "--coverage-dir",
        "../unsafe-coverage"
      ]);

      const output = result.stderr.toString();
      if (!output.includes("Security Error") || !output.includes("outside the current working directory")) {
        return `Expected security error for unsafe coverage-dir, but got: ${output}`;
      }
    },

    "CLI: should block unsafe output file": () => {
      const result = spawnSync("tsx", [
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--reporter",
        "json",
        "--output",
        "/tmp/unsafe-output.json"
      ]);

      const output = result.stderr.toString();
      if (!output.includes("Security Error") || !output.includes("outside the current working directory")) {
        return `Expected security error for unsafe output, but got: ${output}`;
      }
    },

    "Fixtures: should allow local fixtures directory": () => {
      try {
        // user-data.json exists in fixtures/ directory relative to this test file.
        // If we set fixturesDir to 'fixtures', it should work.
        assertFixture("user-data.json", {
          name: "Test User",
          email: "test@example.com",
          age: 30,
          preferences: {
            theme: "dark",
            notifications: true,
          }
        }, { fixturesDir: "fixtures" });
      } catch (e: any) {
        return `Should have allowed local fixtures directory, but got error: ${e.message}`;
      }
    },

    "Fixtures: should block unsafe fixture name": () => {
      try {
        assertFixture("../unsafe-fixture.json", {});
        return "Should have thrown security error for unsafe fixture name";
      } catch (e: any) {
        if (!e.message.includes("Security Error") || !e.message.includes("directory traversal")) {
          return `Unexpected error message: ${e.message}`;
        }
      }
    },

    "Fixtures: should block unsafe fixtures directory": () => {
      try {
        assertFixture("test.json", {}, { fixturesDir: "../../unsafe-dir" });
        return "Should have thrown security error for unsafe fixtures directory";
      } catch (e: any) {
        if (!e.message.includes("Security Error") || !e.message.includes("outside the test directory")) {
          return `Unexpected error message: ${e.message}`;
        }
      }
    }
  }
});
