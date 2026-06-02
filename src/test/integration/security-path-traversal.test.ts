import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

export default test({
  "Security: Path Traversal Protection": {
    setup: () => {
      const tempDir = ".temp-security-test";
      const fullTempDir = path.join(process.cwd(), tempDir);
      if (!fs.existsSync(fullTempDir)) fs.mkdirSync(fullTempDir);
      fs.writeFileSync(path.join(fullTempDir, "dummy.test.js"), "export default { 'test': () => {} };");
      return { tempDir };
    },
    "should block coverage directory outside CWD": ({ tempDir }) => {
      const result = spawnSync("npx", ["tsx", "src/bin/run-tests.ts", tempDir, "--coverage", "--coverage-dir", "../outside"], {
        encoding: "utf8"
      });
      if (!result.stderr.includes("Security Error: Coverage directory '../outside' is outside the current working directory.")) {
        return new Error(`Did not block coverage directory outside CWD. Stderr: ${result.stderr}`);
      }
      return null;
    },
    "should block output file outside CWD": ({ tempDir }) => {
      const result = spawnSync("npx", ["tsx", "src/bin/run-tests.ts", tempDir, "--reporter", "json", "--output", "../outside.json"], {
        encoding: "utf8"
      });
      if (!result.stderr.includes("Security Error: Output file '../outside.json' is outside the current working directory.")) {
        return new Error(`Did not block output file outside CWD. Stderr: ${result.stderr}`);
      }
      return null;
    },
    "should block absolute coverage directory": ({ tempDir }) => {
      const result = spawnSync("npx", ["tsx", "src/bin/run-tests.ts", tempDir, "--coverage", "--coverage-dir", "/tmp/coverage"], {
        encoding: "utf8"
      });
      if (!result.stderr.includes("Security Error: Coverage directory '/tmp/coverage' is outside the current working directory.")) {
        return new Error(`Did not block absolute coverage directory. Stderr: ${result.stderr}`);
      }
      return null;
    },
    teardown: ({ tempDir }) => {
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },
  "Security: Fixture Path Protection": {
    "should block absolute fixture paths": () => {
      try {
        assertFixture("/etc/passwd", {});
        return new Error("Should have thrown error for absolute fixture path");
      } catch (e) {
        if (!e.message.includes("Security Error: Absolute fixture paths are not allowed")) {
          return e;
        }
      }
      return null;
    },
    "should block traversing above fixtures directory": () => {
      try {
        assertFixture("../outside.json", {});
        return new Error("Should have thrown error for traversing above fixtures directory");
      } catch (e) {
        if (!e.message.includes("Security Error: Fixture path '../outside.json' is outside the fixtures directory.")) {
          return e;
        }
      }
      return null;
    }
  }
});
