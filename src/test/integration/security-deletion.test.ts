import { test } from '../../index.js';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { spawnSync } from 'child_process';
import { expect } from 'chai';

test({
  'Security Deletion Tests': {
    'should prevent deletion of directories outside the workspace': async (): Promise<void> => {
      const testDir = path.join(os.tmpdir(), 'sentinel-deletion-test-' + Math.random().toString(36).substring(7));
      if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir);
      }
      const sensitiveFile = path.join(testDir, 'sensitive.txt');
      fs.writeFileSync(sensitiveFile, 'THIS SHOULD NOT BE DELETED');

      try {
        // Run the test runner with coverage-dir pointing to our sensitive directory outside CWD
        // We assume we are running from the repo root
        const result = spawnSync('node', [
            'node_modules/.bin/tsx',
            'src/bin/run-tests.ts',
            'src/test/integration',
            '--coverage',
            '--coverage-dir',
            testDir
        ], { encoding: 'utf8' });

        expect(fs.existsSync(sensitiveFile), 'Sensitive file was deleted!').to.be.true;
        expect(result.stdout + result.stderr).to.include('Security Error');
      } finally {
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
      }
    }
  }
});
