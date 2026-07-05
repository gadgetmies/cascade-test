import { test } from '../../index.js';
import { spawnSync } from 'child_process';
import { expect } from 'chai';
import { assertFixture } from '../../lib/fixture-utils.js';

test({
  'Security: Path Traversal': {
    'CLI: should block unsafe paths': () => {
      const cases = [
        { args: ['--output', '../t.json'], err: "Output path '../t.json' is outside CWD." },
        { args: ['--coverage', '--coverage-dir', '/tmp/m'], err: "Coverage directory '/tmp/m' is outside CWD." },
        { args: ['--coverage', '--coverage-dir', '.'], err: "Cannot use CWD as coverage directory." }
      ];
      for (const { args, err } of cases) {
        const r = spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/integration', ...args], { encoding: 'utf8' });
        expect(r.stderr).to.contain(err);
      }
    },
    'Fixture: should block traversal': () => {
      expect(() => assertFixture('../../etc/passwd', {})).to.throw('Security Error');
    }
  }
});
