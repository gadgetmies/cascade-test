import { test } from '../../index.js';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../');
const runTestsScript = path.resolve(projectRoot, 'src/bin/run-tests.ts');

test({
  'Security Deletion Tests': {
    'should block unsafe coverage directory and not delete files': async () => {
      const trapDir = path.resolve(projectRoot, 'trap_dir_security_test');
      if (!fs.existsSync(trapDir)) {
        fs.mkdirSync(trapDir);
      }
      const trapFile = path.join(trapDir, 'important_file');
      fs.writeFileSync(trapFile, 'STAY SAFE');

      try {
        const result = await new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
          const child = spawn('npx', [
            'tsx',
            runTestsScript,
            'src/test/integration',
            '--regex', 'nonexistent',
            '--coverage',
            '--coverage-dir', '../trap_dir_security_test'
          ], {
            cwd: projectRoot
          });

          let stdout = '';
          let stderr = '';
          child.stdout.on('data', (data) => stdout += data.toString());
          child.stderr.on('data', (data) => stderr += data.toString());
          child.on('exit', (code) => resolve({ code: code || 0, stdout, stderr }));
        });

        if (result.code !== 1) {
          return `Expected exit code 1, but got ${result.code}`;
        }

        if (!result.stderr.includes('Security Error')) {
          return `Expected stderr to include "Security Error", but got: ${result.stderr}`;
        }

        if (!fs.existsSync(trapFile)) {
          return 'VULNERABILITY: Trap file was deleted!';
        }
      } finally {
        if (fs.existsSync(trapFile)) {
          fs.unlinkSync(trapFile);
        }
        if (fs.existsSync(trapDir)) {
          fs.rmdirSync(trapDir);
        }
      }
    },

    'should block current working directory as coverage directory': async () => {
        const result = await new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
          const child = spawn('npx', [
            'tsx',
            runTestsScript,
            'src/test/integration',
            '--regex', 'nonexistent',
            '--coverage',
            '--coverage-dir', '.'
          ], {
            cwd: projectRoot
          });

          let stdout = '';
          let stderr = '';
          child.stdout.on('data', (data) => stdout += data.toString());
          child.stderr.on('data', (data) => stderr += data.toString());
          child.on('exit', (code) => resolve({ code: code || 0, stdout, stderr }));
        });

        if (result.code !== 1) {
          return `Expected exit code 1, but got ${result.code}`;
        }

        if (!result.stderr.includes('Security Error')) {
          return `Expected stderr to include "Security Error", but got: ${result.stderr}`;
        }
    }
  }
});
