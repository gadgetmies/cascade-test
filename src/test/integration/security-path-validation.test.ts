import { spawnSync } from 'child_process';
import test from '../../lib/test.js';
import { expect } from 'chai';
export default test({
  "Security": {
    "path traversal": () => {
      const r = (a: string[]) => spawnSync('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', ...a], { encoding: 'utf8' });
      expect(r(['--coverage', '--coverage-dir', '../u']).stderr).to.contain("Security Error");
      expect(r(['--output', '../u.json']).stderr).to.contain("Security Error");
      expect(r(['--coverage', '--coverage-dir', '.']).stderr).to.contain("Security Error");
    }
  }
});
