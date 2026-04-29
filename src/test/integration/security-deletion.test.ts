import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export default test({
  "Security: Directory Deletion": {
    "should block deletion of directories outside CWD via coverage-dir": () => {
      const testPath = "src/test/examples";
      // Ensure the trap is truly outside the current working directory
      const outsideDir = path.resolve(process.cwd(), "..", "outside_test_dir_traversal");
      if (!fs.existsSync(outsideDir)) {
          try {
            fs.mkdirSync(outsideDir);
          } catch (e) {
            // If we can't create it there, use a different strategy or skip
            // In the sandbox, /app is the CWD, so /outside_test_dir_traversal might work
            return;
          }
      }
      const trapFile = path.join(outsideDir, "trap.txt");
      fs.writeFileSync(trapFile, "don't delete me");

      try {
        const result = spawnSync("node", [
          "dist/bin/run-tests.js",
          testPath,
          "--coverage",
          "--coverage-dir",
          "../../outside_test_dir_traversal",
          "--regex",
          "basic.test.ts"
        ], { encoding: "utf8" });

        if (fs.existsSync(trapFile)) {
          if (result.stderr.includes("Security Error")) {
              return; // Passed
          }
          return `Security Error was NOT thrown. Status: ${result.status}. Error: ${result.stderr}`;
        } else {
          return "VULNERABILITY: Directory was deleted!";
        }
      } finally {
        if (fs.existsSync(outsideDir)) {
          fs.rmSync(outsideDir, { recursive: true, force: true });
        }
      }
    }
  }
});
