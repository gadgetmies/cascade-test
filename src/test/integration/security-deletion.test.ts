import { spawnSync } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import { expect } from 'chai';
import { test } from '../../index.js';

test({
  'Security: Directory Deletion Protection': {
    'blocks deletion of paths outside the project root': (): void => {
      const unsafePath = path.join(os.tmpdir(), 'sentinel-test-should-not-be-deleted');
      const result = spawnSync('npx', [
        'tsx',
        'src/bin/run-tests.ts',
        'src/test/examples',
        '--coverage',
        '--coverage-dir',
        unsafePath
      ], { encoding: 'utf8' });

      expect(result.stderr).to.include('Security Error: Coverage directory');
      expect(result.status).to.equal(1);
    },

    'blocks deletion of the project root itself': (): void => {
      const result = spawnSync('npx', [
        'tsx',
        'src/bin/run-tests.ts',
        'src/test/examples',
        '--coverage',
        '--coverage-dir',
        '.'
      ], { encoding: 'utf8' });

      expect(result.stderr).to.include('Security Error: Coverage directory');
      expect(result.status).to.equal(1);
    },

    'blocks deletion of parent directories': (): void => {
      const result = spawnSync('npx', [
        'tsx',
        'src/bin/run-tests.ts',
        'src/test/examples',
        '--coverage',
        '--coverage-dir',
        '..'
      ], { encoding: 'utf8' });

      expect(result.stderr).to.include('Security Error: Coverage directory');
      expect(result.status).to.equal(1);
    },

    'allows valid subdirectories': (): void => {
      // Use a nested subdirectory to avoid conflicting with existing 'coverage'
      const safePath = 'tmp-test-coverage-safe';
      const result = spawnSync('npx', [
        'tsx',
        'src/bin/run-tests.ts',
        'src/test/examples',
        '--regex',
        'basic.test.ts', // Run a small test to be fast
        '--coverage',
        '--coverage-dir',
        safePath
      ], { encoding: 'utf8' });

      // It should NOT have the security error
      expect(result.stderr).to.not.include('Security Error: Coverage directory');
    }
  }
});
