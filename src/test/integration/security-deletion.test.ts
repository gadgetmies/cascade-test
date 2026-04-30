import { test } from '../../index.js';
import { TestContext } from '../../types.js';
import { spawnSync } from 'child_process';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';

test({
  setup: async (): Promise<TestContext> => ({}),

  'Security: Coverage Directory Deletion': {
    'should block attempts to use a coverage directory outside CWD': (): void => {
      const trapDir = path.resolve(process.cwd(), 'trap_directory_security_test');
      if (!fs.existsSync(trapDir)) {
        fs.mkdirSync(trapDir);
      }
      fs.writeFileSync(path.join(trapDir, 'secret.txt'), 'should not be deleted');

      try {
        // We use a path that resolves to trapDir but looks suspicious
        const suspiciousPath = './trap_directory_security_test/../../trap_directory_security_test';

        const result = spawnSync('npx', [
          'tsx',
          'src/bin/run-tests.ts',
          'src/test/integration/framework.test.ts',
          '--coverage',
          '--coverage-dir',
          suspiciousPath
        ], { encoding: 'utf8' });

        // Once the fix is in, we expect an error message and the directory to still exist.
        // For now, if the vulnerability is present, it might delete it.

        expect(fs.existsSync(path.join(trapDir, 'secret.txt')), 'File should not be deleted').to.be.true;

        // After the fix, we should check for a specific security error message in stderr
        expect(result.stderr).to.contain('Security Error');
      } finally {
        if (fs.existsSync(trapDir)) {
          fs.rmSync(trapDir, { recursive: true, force: true });
        }
      }
    },

    'should block absolute paths for coverage directory': (): void => {
        const trapDir = path.resolve(process.cwd(), 'trap_directory_absolute');
        if (!fs.existsSync(trapDir)) {
          fs.mkdirSync(trapDir);
        }

        try {
          const result = spawnSync('npx', [
            'tsx',
            'src/bin/run-tests.ts',
            'src/test/integration/framework.test.ts',
            '--coverage',
            '--coverage-dir',
            trapDir
          ], { encoding: 'utf8' });

          expect(result.stderr).to.contain('Security Error');
        } finally {
          if (fs.existsSync(trapDir)) {
            fs.rmSync(trapDir, { recursive: true, force: true });
          }
        }
    }
  }
});
