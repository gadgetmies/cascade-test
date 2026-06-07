import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const runTestsPath = path.resolve(__dirname, "../../bin/run-tests.ts");

test({
  "Security Path Validation": {
    "should block coverage directory outside CWD": () => {
      const result = spawnSync("npx", ["tsx", runTestsPath, "src/test/examples", "--coverage", "--coverage-dir", "../unsafe-coverage"], { encoding: "utf8" });
      if (!result.stderr.includes("Security Error")) {
        return "Expected Security Error for outside coverage directory";
      }
    },
    "should block output file outside CWD": () => {
      const result = spawnSync("npx", ["tsx", runTestsPath, "src/test/examples", "--output", "../unsafe-output.json"], { encoding: "utf8" });
      if (!result.stderr.includes("Security Error")) {
        return "Expected Security Error for outside output file";
      }
    },
    "should block coverage directory pointing to CWD": () => {
      const result = spawnSync("npx", ["tsx", runTestsPath, "src/test/examples", "--coverage", "--coverage-dir", "."], { encoding: "utf8" });
      if (!result.stderr.includes("Security Error")) {
        return "Expected Security Error for CWD coverage directory";
      }
    }
  }
});
