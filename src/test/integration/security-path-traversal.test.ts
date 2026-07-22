import test from "../../lib/test.js";
import { readFixture } from "../../lib/fixture-utils.js";
import { spawnSync } from "child_process";
import { expect } from "chai";

test({
  "Security Path Traversal": {
    "fixture path traversal should throw": () => { expect(() => readFixture("../../../passwd")).to.throw("Security Error"); },
    "CLI output outside CWD should be blocked": () => {
      const { stderr } = spawnSync(process.execPath, ["--import", "tsx", "src/bin/run-tests.ts", "src/test/integration", "-o", "../out.xml"]);
      expect(stderr.toString()).to.include("Security Error: Output path");
    },
    "CLI CWD as coverage directory should be blocked": () => {
      const { stderr } = spawnSync(process.execPath, ["--import", "tsx", "src/bin/run-tests.ts", "src/test/integration", "--coverage", "--coverage-dir", "."]);
      expect(stderr.toString()).to.include("Security Error: Cannot use CWD");
    },
  },
});
