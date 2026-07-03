import test from "../../lib/test.js";
import { spawnSync } from "child_process";
import { expect } from "chai";
const run = (a: string[]) => spawnSync(process.execPath, ["--import", "tsx", "src/bin/run-tests.ts", "src/test/examples", "--regex", "basic.test.ts", ...a], { encoding: "utf8" });
export default test({
  setup: () => ({ timeout: 30000 }),
  "Path Traversal": {
    "should block unsafe paths": () => {
      const r1 = run(["--coverage", "--coverage-dir", "../unsafe"]), r2 = run(["--output", "../unsafe.json"]);
      expect(r1.stderr).to.contain("Security Error"); expect(r2.stderr).to.contain("Security Error");
      expect(r1.status).to.equal(1); expect(r2.status).to.equal(1);
    }
  }
});
