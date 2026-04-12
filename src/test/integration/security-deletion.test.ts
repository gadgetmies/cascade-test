import { test } from "../../index.js";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

test({
  "Security Deletion": {
    "should block attempts to delete directories outside CWD": () => {
      const targetDir = path.join(os.tmpdir(), `cascade-test-security-target-${Date.now()}`);
      fs.mkdirSync(targetDir);
      const secretFile = path.join(targetDir, "secret.txt");
      fs.writeFileSync(secretFile, "should not be deleted");

      try {
        // Use a relative path that resolves to the targetDir outside CWD
        const relativePath = path.relative(process.cwd(), targetDir);

        // This should fail validation and not delete the directory
        execSync(
          `npx tsx src/bin/run-tests.ts src/test/integration --coverage --coverage-dir "${relativePath}" --regex "nothing-matches"`,
          { stdio: "pipe" }
        );
      } catch (error: any) {
        // Expected to fail with exit code 1
      }

      const stillExists = fs.existsSync(secretFile);

      // Cleanup
      try {
        fs.rmSync(targetDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }

      if (!stillExists) {
        return "Security vulnerability: Directory outside CWD was deleted!";
      }
      return null;
    },

    "should block attempts to use CWD as coverage directory": () => {
      try {
        execSync(
          `npx tsx src/bin/run-tests.ts src/test/integration --coverage --coverage-dir "." --regex "nothing-matches"`,
          { stdio: "pipe" }
        );
      } catch (error: any) {
        const output = error.stderr.toString() + error.stdout.toString();
        if (output.includes("Invalid coverage directory: .") &&
            output.includes("cannot be the working directory itself")) {
          return null;
        }
        return `Unexpected error output: ${output}`;
      }
      return "Expected command to fail when using CWD as coverage directory";
    }
  }
});
