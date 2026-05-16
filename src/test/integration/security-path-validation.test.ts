import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as path from "path";
import { fileURLToPath } from "url";
import { expect } from "chai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const runTestsPath = path.resolve(__dirname, "../../bin/run-tests.ts");

test({
  "Security Path Validation": {
    "should block coverage directory outside CWD": () => {
      const result = spawnSync("npx", ["tsx", runTestsPath, ".", "--regex", "security-path-validation.test.ts", "--coverage", "--coverage-dir", "../unsafe-coverage"], {
        encoding: "utf8",
        cwd: process.cwd()
      });

      expect(result.stderr).to.contain("Security Error: Coverage directory '../unsafe-coverage' is outside the current working directory or points to it.");
      expect(result.status).to.equal(1);
    },

    "should block coverage directory pointing to CWD": () => {
      const result = spawnSync("npx", ["tsx", runTestsPath, ".", "--regex", "security-path-validation.test.ts", "--coverage", "--coverage-dir", "."], {
        encoding: "utf8",
        cwd: process.cwd()
      });

      expect(result.stderr).to.contain("Security Error: Coverage directory '.' is outside the current working directory or points to it.");
      expect(result.status).to.equal(1);
    },

    "should block output file outside CWD": () => {
      const result = spawnSync("npx", ["tsx", runTestsPath, ".", "--regex", "security-path-validation.test.ts", "--reporter", "json", "--output", "../unsafe-results.json"], {
        encoding: "utf8",
        cwd: process.cwd()
      });

      expect(result.stderr).to.contain("Security Error: Output file path '../unsafe-results.json' is outside the current working directory or points to it.");
      expect(result.status).to.equal(1);
    },

    "should block absolute paths for coverage directory": () => {
      const result = spawnSync("npx", ["tsx", runTestsPath, ".", "--regex", "security-path-validation.test.ts", "--coverage", "--coverage-dir", "/tmp/coverage"], {
        encoding: "utf8",
        cwd: process.cwd()
      });

      expect(result.stderr).to.contain("Security Error: Coverage directory '/tmp/coverage' is outside the current working directory or points to it.");
      expect(result.status).to.equal(1);
    }
  }
});
