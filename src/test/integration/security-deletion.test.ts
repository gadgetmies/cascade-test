import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { expect } from "chai";

export default test("Security Deletion", async () => {
  const tmpDir = path.join(os.tmpdir(), "cascade-test-security-test-" + Date.now());
  fs.mkdirSync(tmpDir);
  const targetDir = path.join(tmpDir, "should-not-be-deleted");
  fs.mkdirSync(targetDir);
  fs.writeFileSync(path.join(targetDir, "secret.txt"), "protected");

  try {
    const result = spawnSync("npx", [
      "tsx",
      "src/bin/run-tests.ts",
      "src/test/examples",
      "--regex", "basic.test.ts",
      "--coverage",
      "--coverage-dir",
      targetDir,
    ], { encoding: "utf8" });

    // Verify the file still exists (it was not deleted)
    expect(fs.existsSync(path.join(targetDir, "secret.txt")), "VULNERABILITY: Directory outside of project root was deleted!").to.be.true;
    // Verify the security error message was shown
    expect(result.stderr).to.include("Security Error: Coverage directory must be within the current working directory");
  } finally {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
});
