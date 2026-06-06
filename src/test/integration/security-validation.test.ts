import test from "../../lib/test.js";
import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { assertFixture } from "../../lib/fixture-utils.js";

test({
  setup: () => ({ timeout: 30000 }),
  "Security: Path Traversal Protection": {
    "should block coverage dir outside CWD": () => {
      const malDir = path.join("/tmp", `ct-sec-${Date.now()}`);
      if (!fs.existsSync(malDir)) fs.mkdirSync(malDir, { recursive: true });
      const secret = path.join(malDir, "secret.txt");
      fs.writeFileSync(secret, "TOP SECRET");
      try {
        const res = spawnSync("npx", ["tsx", "src/bin/run-tests.ts", "src/test/integration", "--regex", "timeout", "--coverage", "--coverage-dir", malDir], { encoding: "utf8" });
        if (!fs.existsSync(secret)) return "VULNERABILITY: File deleted!";
        if (!res.stderr.includes("Security Error")) return "Expected Security Error";
      } finally { fs.rmSync(malDir, { recursive: true, force: true }); }
    },
    "should block fixture traversal": () => {
      try { assertFixture("../package.json", {}); return "Expected Security Error"; }
      catch (e: any) { if (!e.message.includes("Security Error")) return `Wrong error: ${e.message}`; }
    }
  }
});
