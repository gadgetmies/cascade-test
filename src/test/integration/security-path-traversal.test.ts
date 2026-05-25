import { test } from '../../index.js';
import { spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { expect } from 'chai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const runTestsBin = path.resolve(projectRoot, 'src/bin/run-tests.ts');

test({
  setup: async () => ({ timeout: 60000 }),
  'Security: Path Traversal': {
    'should block --coverage-dir outside project root': async () => {
      // Use a path that is definitely outside CWD but writable, like /tmp
      const trapDir = path.join('/tmp', 'trap-coverage-' + Date.now());
      const trapFile = path.join(trapDir, 'do-not-delete.txt');

      try {
        fs.mkdirSync(trapDir, { recursive: true });
        fs.writeFileSync(trapFile, 'vulnerable');

        const result = spawnSync('npx', [
          'tsx',
          runTestsBin,
          'src/test/examples',
          '--coverage',
          '--coverage-dir',
          trapDir
        ], { cwd: projectRoot, encoding: 'utf8' });

        const output = result.stderr + result.stdout;
        const fileStillExists = fs.existsSync(trapFile);

        expect(output).to.contain('Security Error');
        expect(fileStillExists).to.be.true;
      } finally {
        if (fs.existsSync(trapDir)) {
          fs.rmSync(trapDir, { recursive: true, force: true });
        }
      }
    },

    'should block --output outside project root': async () => {
      const trapFile = path.join('/tmp', 'trap-output-' + Date.now() + '.json');

      try {
        const result = spawnSync('npx', [
          'tsx',
          runTestsBin,
          'src/test/examples',
          '--reporter', 'json',
          '--output', trapFile
        ], { cwd: projectRoot, encoding: 'utf8' });

        const output = result.stderr + result.stdout;
        expect(output).to.contain('Security Error');
        expect(fs.existsSync(trapFile)).to.be.false;
      } finally {
        if (fs.existsSync(trapFile)) {
          fs.unlinkSync(trapFile);
        }
      }
    }
  }
});
