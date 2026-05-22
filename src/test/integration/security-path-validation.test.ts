import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { expect } from "chai";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test({
  "Path Validation Security": {
    "should block coverage directory outside CWD": () => {
      const result = spawnSync("npx", ["tsx", "src/bin/run-tests.ts", "src/test/examples", "--coverage", "--coverage-dir", "../outside"], {
        encoding: "utf8"
      });
      expect(result.stderr).to.contain("Security Error: Coverage directory '../outside' is outside the current working directory or points to it.");
      expect(result.status).to.equal(1);
    },

    "should block coverage directory pointing to CWD": () => {
      const result = spawnSync("npx", ["tsx", "src/bin/run-tests.ts", "src/test/examples", "--coverage", "--coverage-dir", "."], {
        encoding: "utf8"
      });
      expect(result.stderr).to.contain("Security Error: Coverage directory '.' is outside the current working directory or points to it.");
      expect(result.status).to.equal(1);
    },

    "should block output file outside CWD": () => {
      const result = spawnSync("npx", ["tsx", "src/bin/run-tests.ts", "src/test/examples", "--reporter", "json", "--output", "../results.json"], {
        encoding: "utf8"
      });
      expect(result.stderr).to.contain("Security Error: Output file '../results.json' is outside the current working directory or points to it.");
      expect(result.status).to.equal(1);
    }
  }
});
