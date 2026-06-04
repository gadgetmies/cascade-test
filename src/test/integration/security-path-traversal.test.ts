import { test } from "../../index.js";
import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import "colors";

test({
  "Security: Path Traversal": {
    "should block deleting directories outside CWD via --coverage-dir": () => {
      const sensitiveDir = path.resolve(process.cwd(), "security-test-blocked");
      const targetFile = path.join(sensitiveDir, "secret.txt");

      if (!fs.existsSync(sensitiveDir)) {
        fs.mkdirSync(sensitiveDir, { recursive: true });
      }
      fs.writeFileSync(targetFile, "Sensitive information");

      try {
        const result = spawnSync("npx", [
          "tsx",
          "src/bin/run-tests.ts",
          "src/test/examples",
          "--glob", "basic.test.ts",
          "--coverage",
          "--coverage-dir", "../security-test-blocked"
        ], {
          encoding: "utf-8",
          env: { ...process.env, NODE_V8_COVERAGE: "" }
        });

        // The file should still exist because the traversal was blocked
        const fileExists = fs.existsSync(targetFile);

        if (!fileExists) {
          return `VULNERABILITY STILL PRESENT: ${targetFile} was deleted!`.red;
        }

        if (!result.stderr.includes("Security Error")) {
          return `Expected security error message in stderr, but got: ${result.stderr}`.red;
        }
      } finally {
        if (fs.existsSync(targetFile)) {
          fs.unlinkSync(targetFile);
        }
        if (fs.existsSync(sensitiveDir)) {
          fs.rmSync(sensitiveDir, { recursive: true, force: true });
        }
      }

      return null;
    }
  }
});
