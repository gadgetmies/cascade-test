import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { spawnSync } from "child_process";
import * as path from "path";

test({
  "Security: Path Traversal Protection": {
    "CLI: should reject output path outside CWD": () => {
      const result = spawnSync(process.execPath, ["--import", "tsx", "src/bin/run-tests.ts", "src/test/integration", "--output", "../unsafe-output.json"], { encoding: "utf8" });
      if (!result.stderr.includes("Security Error: Output path '../unsafe-output.json' is outside CWD.")) {
        return `Expected security error for output path, but got: ${result.stderr}`;
      }
    },

    "CLI: should reject coverage directory outside CWD": () => {
      const result = spawnSync(process.execPath, ["--import", "tsx", "src/bin/run-tests.ts", "src/test/integration", "--coverage", "--coverage-dir", "/tmp/unsafe-coverage"], { encoding: "utf8" });
      if (!result.stderr.includes("Security Error: Coverage directory '/tmp/unsafe-coverage' is outside CWD.")) {
        return `Expected security error for coverage directory, but got: ${result.stderr}`;
      }
    },

    "Library: assertFixture should reject traversal in fixtureName": () => {
      try {
        assertFixture("../../../package.json", {});
        return "Expected assertFixture to throw Security Error for path traversal";
      } catch (e) {
        if (!(e as Error).message.includes("Security Error: Fixture path '../../../package.json' is outside fixtures directory.")) {
          return `Unexpected error message: ${(e as Error).message}`;
        }
      }
    }
  }
});
