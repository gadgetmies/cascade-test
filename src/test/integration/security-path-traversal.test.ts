import test from '../../lib/test.js';
import { spawnSync } from 'child_process';
import { expect } from 'chai';
import * as path from 'path';
import { assertFixture } from '../../lib/fixture-utils.js';

test({
  'Security: Path Traversal Protection': {
    'should block output path outside CWD': () => {
      const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--output', '../unsafe-output.json'], { encoding: 'utf-8' });
      expect(result.stderr).to.contain('Security Error: Output path \'../unsafe-output.json\' is outside CWD.');
      expect(result.status).to.equal(1);
    },

    'should block coverage directory outside CWD': () => {
      const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--coverage', '--coverage-dir', '../unsafe-coverage'], { encoding: 'utf-8' });
      expect(result.stderr).to.contain('Security Error: Coverage directory \'../unsafe-coverage\' is outside CWD.');
      expect(result.status).to.equal(1);
    },

    'should block fixture path traversal': () => {
      expect(() => assertFixture('../unsafe-fixture.json', {})).to.throw('Security Error: Fixture path \'../unsafe-fixture.json\' is outside the fixtures directory.');
    }
  }
});
