import { test } from '../../index.js';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

test({
  'Security: Coverage Directory Protection': {
    'should block attempts to delete directories outside the workspace': () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sentinel-test-deletion-'));
      const canaryFile = path.join(tmpDir, 'canary.txt');
      fs.writeFileSync(canaryFile, 'I should not be deleted', 'utf8');

      try {
        const result = spawnSync('npx', [
          'tsx', 'src/bin/run-tests.ts', 'src/test/integration',
          '--coverage',
          '--coverage-dir', tmpDir
        ], { encoding: 'utf8' });

        if (!fs.existsSync(tmpDir)) {
          return 'VULNERABLE: Directory outside workspace was deleted!';
        }

        if (!result.stderr.includes('Security Error') && !result.stdout.includes('Security Error')) {
          return 'FAILED: Should have reported Security Error';
        }

        return null; // Passed
      } finally {
        if (fs.existsSync(tmpDir)) {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        }
      }
    },

    'should block attempts to use current working directory as coverage directory': () => {
      const result = spawnSync('npx', [
        'tsx', 'src/bin/run-tests.ts', 'src/test/integration',
        '--coverage',
        '--coverage-dir', '.'
      ], { encoding: 'utf8' });

      if (!result.stderr.includes('Security Error') && !result.stdout.includes('Security Error')) {
        return 'FAILED: Should have reported Security Error for CWD';
      }

      return null;
    }
  }
});
