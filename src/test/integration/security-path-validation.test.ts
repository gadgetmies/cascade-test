
import { test } from '../../index.js';
import { spawnSync } from 'child_process';
import { assertFixture } from '../../lib/fixture-utils.js';

test({
  'Security Path Validation': {
    'CLI: should reject coverage directory outside CWD': () => {
      const result = spawnSync('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--coverage', '--coverage-dir', '../outside-coverage'], { encoding: 'utf8' });
      if (!result.stderr.includes('Security Error')) return 'Expected security error';
    },
    'CLI: should reject output file outside CWD': () => {
      const result = spawnSync('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--reporter', 'json', '--output', '/tmp/unsafe-output.json'], { encoding: 'utf8' });
      if (!result.stderr.includes('Security Error')) return 'Expected security error';
    },
    'CLI: should reject CWD as coverage directory': () => {
        const result = spawnSync('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--coverage', '--coverage-dir', '.'], { encoding: 'utf8' });
        if (!result.stderr.includes('Security Error')) return 'Expected security error';
    },
    'Fixtures: should reject fixture path traversal': () => {
      try {
        assertFixture('../../../package.json', {});
        return 'Should have thrown a security error';
      } catch (e: any) {
        if (!e.message.includes('Security Error')) return `Unexpected error: ${e.message}`;
      }
    }
  }
});
