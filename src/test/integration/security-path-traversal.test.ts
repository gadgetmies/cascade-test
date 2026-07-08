import test from '../../lib/test.js';
import { expect } from 'chai';
import { spawnSync } from 'child_process';
import { readFixture } from '../../lib/fixture-utils.js';

export default test({
  'Security': {
    'CLI Traversal': () => {
      const run = (args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/integration/fixtures', ...args]);
      const res1 = run(['--output', '../o.json']);
      expect(res1.stderr.toString()).to.include("outside CWD");

      const res2 = run(['--coverage', '--coverage-dir', '../c']);
      expect(res2.stderr.toString()).to.include("outside CWD");

      const res3 = run(['--coverage', '--coverage-dir', '.']);
      expect(res3.stderr.toString()).to.include("Cannot use CWD as coverage directory");
    },
    'Fixture Traversal': () => {
      expect(() => readFixture('../outside.json')).to.throw("outside fixtures directory");
    }
  }
});
