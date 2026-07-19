import { test } from "../../index.js";
import { spawnSync } from "child_process";
import { expect } from "chai";

test({
  timeout: 30000,
  "Security traversal tests": () => {
    const r1 = spawnSync(process.execPath, ["--import", "tsx", "src/bin/run-tests.ts", "src/test/integration/fixtures", "-o", "../out.json"]);
    expect(r1.stderr.toString()).to.include("Security Error: Output path");
    const r2 = spawnSync(process.execPath, ["--import", "tsx", "src/bin/run-tests.ts", "src/test/integration/fixtures", "--coverage", "--coverage-dir", "../cov"]);
    expect(r2.stderr.toString()).to.include("Security Error: Coverage directory");
    const r3 = spawnSync(process.execPath, ["--import", "tsx", "src/bin/run-tests.ts", "src/test/integration/fixtures", "--coverage", "--coverage-dir", "."]);
    expect(r3.stderr.toString()).to.include("Security Error: Cannot use CWD as coverage directory.");
  }
});
