import { test } from '../../index.js';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../');

test({
  setup: () => {
    return { timeout: 60000 };
  },
  'Security: Path Validation': {
    'should block coverage directory outside current working directory': async (context: any) => {
      const trapDir = path.join(rootDir, '..', 'trap-coverage-' + Date.now());
      const binPath = path.join(rootDir, 'src/bin/run-tests.ts');

      const child = spawn('npx', ['tsx', binPath, 'src/test/examples', '--coverage', '--coverage-dir', trapDir], {
        cwd: rootDir
      });

      let stderr = '';
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          child.kill();
          resolve('Process timed out');
        }, 55000);

        child.on('close', (code) => {
          clearTimeout(timer);
          try {
            const isBlocked = stderr.includes('Security Error');
            if (!isBlocked && fs.existsSync(trapDir)) {
              fs.rmSync(trapDir, { recursive: true, force: true });
              resolve('Security vulnerability: coverage directory outside CWD was not blocked');
            } else {
              resolve(null);
            }
          } catch (e) {
            resolve(`Error in test: ${e}`);
          }
        });
      });
    },

    'should block output file outside current working directory': async (context: any) => {
      const trapFile = path.join(rootDir, '..', 'trap-output-' + Date.now() + '.json');
      const binPath = path.join(rootDir, 'src/bin/run-tests.ts');

      const child = spawn('npx', ['tsx', binPath, 'src/test/examples', '--reporter', 'json', '--output', trapFile], {
        cwd: rootDir
      });

      let stderr = '';
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          child.kill();
          resolve('Process timed out');
        }, 55000);

        child.on('close', (code) => {
          clearTimeout(timer);
          try {
            const isBlocked = stderr.includes('Security Error');
            if (!isBlocked && fs.existsSync(trapFile)) {
              fs.unlinkSync(trapFile);
              resolve('Security vulnerability: output file outside CWD was not blocked');
            } else {
              resolve(null);
            }
          } catch (e) {
            resolve(`Error in test: ${e}`);
          }
        });
      });
    }
  }
});
