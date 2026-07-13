import test from '../../lib/test.js';
import { assertFixture } from '../../lib/fixture-utils.js';
import { expect } from 'chai';
import { spawnSync } from 'child_process';
import * as path from 'path';

test({
  'Fixture Path Traversal Protection': {
    'should throw security error for upward traversal': () => {
      expect(() => assertFixture('../traversal.json', {})).to.throw('Security Error');
    },
    'should throw security error for absolute path traversal': () => {
      expect(() => assertFixture('/tmp/traversal.json', {})).to.throw('Security Error');
    }
  },
  'CLI Path Traversal Protection': {
    'should block unsafe output path': () => {
      const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/integration/fixtures', '--output', '../unsafe.xml'], { encoding: 'utf8' });
      expect(result.stderr).to.contain('Security Error: Output path \'../unsafe.xml\' is outside CWD.');
    },
    'should block unsafe coverage directory': () => {
      const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/integration/fixtures', '--coverage', '--coverage-dir', '../unsafe-coverage'], { encoding: 'utf8' });
      expect(result.stderr).to.contain('Security Error: Coverage directory \'../unsafe-coverage\' is outside CWD.');
    },
    'should block CWD as coverage directory': () => {
      const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/integration/fixtures', '--coverage', '--coverage-dir', '.'], { encoding: 'utf8' });
      expect(result.stderr).to.contain('Security Error: Cannot use CWD as coverage directory.');
    }
  }
});
