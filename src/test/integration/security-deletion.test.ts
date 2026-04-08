import { test } from '../../index.js';
import { spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { expect } from 'chai';

test({
  'Security: Coverage Directory Traversal': {
    'should block coverage directory outside of workspace': () => {
      const outsideDir = path.join(os.tmpdir(), 'cascade-test-security-' + Math.random().toString(36).substring(7));
      fs.mkdirSync(outsideDir);
      const secretFile = path.join(outsideDir, 'secret.txt');
      fs.writeFileSync(secretFile, 'should not be deleted');

      try {
        const relativePath = path.relative(process.cwd(), outsideDir);

        const result = spawnSync('npx', [
          'tsx',
          'src/bin/run-tests.ts',
          'src/test/integration',
          '--regex', 'framework.test.ts',
          '--coverage',
          '--coverage-dir', relativePath
        ], { encoding: 'utf8' });

        expect(result.status).to.equal(1);
        expect(result.stderr).to.contain('Security Error');
        expect(fs.existsSync(secretFile)).to.equal(true, 'Outside file should still exist');
      } finally {
        if (fs.existsSync(outsideDir)) {
          fs.rmSync(outsideDir, { recursive: true, force: true });
        }
      }
    },

    'should block coverage directory being the workspace root': () => {
      const result = spawnSync('npx', [
        'tsx',
        'src/bin/run-tests.ts',
        'src/test/integration',
        '--regex', 'framework.test.ts',
        '--coverage',
        '--coverage-dir', '.'
      ], { encoding: 'utf8' });

      expect(result.status).to.equal(1);
      expect(result.stderr).to.contain('Security Error');
    },

    'should block coverage directory using traversal to go outside': () => {
      const result = spawnSync('npx', [
        'tsx',
        'src/bin/run-tests.ts',
        'src/test/integration',
        '--regex', 'framework.test.ts',
        '--coverage',
        '--coverage-dir', '../anything'
      ], { encoding: 'utf8' });

      expect(result.status).to.equal(1);
      expect(result.stderr).to.contain('Security Error');
    }
  }
});
