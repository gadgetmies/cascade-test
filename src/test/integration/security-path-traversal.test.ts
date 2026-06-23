import { test } from "../../index.js";
import { expect } from "chai";
import { spawnSync } from "child_process";
import { assertFixture } from "../../lib/fixture-utils.js";

test({
  "Path Traversal Security Tests": {
    "CLI: should block --output outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--output",
        "../unsafe.json",
      ]);
      expect(result.stderr.toString()).to.contain("Security Error: Output path '../unsafe.json' is outside the current working directory.");
    },

    "CLI: should block --coverage-dir outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        "../unsafe-coverage",
      ]);
      expect(result.stderr.toString()).to.contain("Security Error: Coverage directory '../unsafe-coverage' is outside the current working directory.");
    },

    "CLI: should block --coverage-dir as CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/examples",
        "--coverage",
        "--coverage-dir",
        ".",
      ]);
      expect(result.stderr.toString()).to.contain("Security Error: Cannot use current working directory as coverage directory.");
    },

    "FixtureUtils: should block traversal in fixtureName": () => {
      expect(() => assertFixture("../../../package.json", {})).to.throw(
        "Security Error: Fixture name '../../../package.json' attempts to escape the fixtures directory."
      );
    },
  },
});
