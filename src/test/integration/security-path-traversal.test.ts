import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { expect } from "chai";
import { spawnSync } from 'child_process';
const run = (a: string[]) => spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/integration/subfolder', ...a], { encoding: 'utf-8', timeout: 60000 });
test({ "Security": {
  "fixture traversal": () => { expect(() => assertFixture("../x.json", {})).to.throw("Security Error"); },
  "CLI traversal": () => {
    [['--coverage-dir', '../up'], ['--coverage-dir', '.'], ['--output', '../x.json']].forEach(args => {
      const r = run(['--coverage', ...args]);
      expect(r.stderr).to.include('Security Error');
      expect(r.status).to.equal(1);
    });
  }
}});
