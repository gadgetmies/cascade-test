import { test } from '../../index.js';
import { assertFixture } from '../../lib/fixture-utils.js';
import { spawnSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test({
  'Security Path Validation': {
    'should block coverage directory outside CWD': () => {
      const result = spawnSync('npx', [
        'tsx',
        'src/bin/run-tests.ts',
        'src/test/examples',
        '--coverage',
        '--coverage-dir', '../outside'
      ], { encoding: 'utf8' });

      if (!result.stderr.includes('Security Error')) {
        return 'Expected Security Error for outside coverage directory';
      }
    },

    'should block coverage directory pointing to CWD': () => {
        const result = spawnSync('npx', [
          'tsx',
          'src/bin/run-tests.ts',
          'src/test/examples',
          '--coverage',
          '--coverage-dir', '.'
        ], { encoding: 'utf8' });

        if (!result.stderr.includes('Security Error')) {
          return 'Expected Security Error for CWD as coverage directory';
        }
    },

    'should block output file outside CWD': () => {
        const result = spawnSync('npx', [
          'tsx',
          'src/bin/run-tests.ts',
          'src/test/examples',
          '--reporter', 'json',
          '--output', '../results.json'
        ], { encoding: 'utf8' });

        if (!result.stderr.includes('Security Error')) {
          return 'Expected Security Error for outside output file';
        }
    },

    'should block path traversal in fixtures': () => {
        try {
            assertFixture('../traversal.json', { data: 'test' });
            return 'Expected Security Error for fixture path traversal';
        } catch (e: any) {
            if (!e.message.includes('Security Error')) {
                return `Expected Security Error, but got: ${e.message}`;
            }
        }
    }
  }
});
