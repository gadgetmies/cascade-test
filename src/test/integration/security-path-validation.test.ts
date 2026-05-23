import { test } from "../../index.js";
import { expect } from "chai";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import os from "os";

test({
  setup: () => ({ timeout: 60000 }),
  "Security: Path Validation": {
    "should prevent coverage directory traversal": () => {
      const trapDir = path.join(os.tmpdir(), "trap-dir-cov");
      if (fs.existsSync(trapDir)) fs.rmSync(trapDir, { recursive: true, force: true });
      fs.mkdirSync(trapDir);
      const trapFile = path.join(trapDir, "secret.txt");
      fs.writeFileSync(trapFile, "top secret");
      try { execSync(`npx tsx src/bin/run-tests.ts src/test/examples --coverage --coverage-dir ${trapDir}`); } catch (e) {}
      const exists = fs.existsSync(trapFile);
      fs.rmSync(trapDir, { recursive: true, force: true });
      expect(exists, "Trap file outside CWD should NOT have been deleted").to.be.true;
    },
    "should prevent output file traversal": () => {
      const trapFile = path.join(process.cwd(), "..", "trap-results.json");
      if (fs.existsSync(trapFile)) fs.unlinkSync(trapFile);
      try { execSync(`npx tsx src/bin/run-tests.ts src/test/examples --reporter=json --output=../trap-results.json`); } catch (e) {}
      const created = fs.existsSync(trapFile);
      if (created) fs.unlinkSync(trapFile);
      expect(created, "Output file should NOT have been created outside CWD").to.be.false;
    }
  }
});
