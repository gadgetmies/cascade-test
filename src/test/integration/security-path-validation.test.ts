import { test } from "../../index.js";
import { execSync } from "child_process";
import path from "path";

test({
  "Security: Path Validation": {
    "should reject coverage directory outside CWD": () => {
      try {
        execSync("npx tsx src/bin/run-tests.ts src/test/integration --coverage --coverage-dir ../unsafe", { stdio: 'pipe' });
        return "Should have failed with security error";
      } catch (error: any) {
        const stderr = error.stderr.toString();
        if (!stderr.includes("Security Error: Coverage directory '../unsafe' is outside the current working directory or points to it.")) {
          return `Unexpected error output: ${stderr}`;
        }
      }
    },
    "should reject output file outside CWD": () => {
      try {
        execSync("npx tsx src/bin/run-tests.ts src/test/integration --reporter json --output ../unsafe.json", { stdio: 'pipe' });
        return "Should have failed with security error";
      } catch (error: any) {
        const stderr = error.stderr.toString();
        if (!stderr.includes("Security Error: Output path '../unsafe.json' is outside the current working directory or points to it.")) {
          return `Unexpected error output: ${stderr}`;
        }
      }
    },
    "should reject coverage directory pointing to CWD": () => {
      try {
        execSync("npx tsx src/bin/run-tests.ts src/test/integration --coverage --coverage-dir .", { stdio: 'pipe' });
        return "Should have failed with security error";
      } catch (error: any) {
        const stderr = error.stderr.toString();
        if (!stderr.includes("Security Error: Coverage directory '.' is outside the current working directory or points to it.")) {
          return `Unexpected error output: ${stderr}`;
        }
      }
    }
  }
});
