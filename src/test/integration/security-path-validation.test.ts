import { test } from '../../index.js';
import { spawn } from 'child_process';
import * as path from 'path';

test({
  'Security: Path Validation': {
    'should block unsafe --coverage-dir': async () => {
      return new Promise((resolve) => {
        const child = spawn('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--coverage', '--coverage-dir', '../unsafe-dir']);
        let stderr = '';
        child.stderr.on('data', (data) => { stderr += data.toString(); });
        child.on('exit', (code) => {
          if (code === 1 && stderr.includes('Security Error')) {
            resolve();
          } else {
            resolve(`Expected security error for unsafe coverage dir, got exit code ${code}. Stderr: ${stderr}`);
          }
        });
      });
    },

    'should block unsafe --output': async () => {
      return new Promise((resolve) => {
        const child = spawn('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--reporter', 'json', '--output', '/tmp/unsafe-output.json']);
        let stderr = '';
        child.stderr.on('data', (data) => { stderr += data.toString(); });
        child.on('exit', (code) => {
          if (code === 1 && stderr.includes('Security Error')) {
            resolve();
          } else {
            resolve(`Expected security error for unsafe output path, got exit code ${code}. Stderr: ${stderr}`);
          }
        });
      });
    }
  }
});
