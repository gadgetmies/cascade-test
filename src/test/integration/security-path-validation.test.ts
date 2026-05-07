
import { test } from '../../index.js';
import { assertFixture } from '../../lib/fixture-utils.js';
import { spawn } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default test({
  'Security: Path Traversal Prevention': {
    'should block coverage directory outside CWD': async () => {
        return new Promise((resolve) => {
            const child = spawn('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--coverage', '--coverage-dir', '../outside'], {
                cwd: process.cwd()
            });

            let stderr = '';
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('exit', (code) => {
                if (code === 1 && stderr.includes('Security Error')) {
                    resolve(null);
                } else {
                    resolve(`Expected exit code 1 and security error message, but got code ${code} and stderr: ${stderr}`);
                }
            });
        });
    },

    'should block output file outside CWD': async () => {
        return new Promise((resolve) => {
            const child = spawn('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--reporter', 'json', '--output', '../unsafe.json'], {
                cwd: process.cwd()
            });

            let stderr = '';
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('exit', (code) => {
                if (code === 1 && stderr.includes('Security Error')) {
                    resolve(null);
                } else {
                    resolve(`Expected exit code 1 and security error message, but got code ${code} and stderr: ${stderr}`);
                }
            });
        });
    },

    'should block coverage directory pointing to CWD': async () => {
        return new Promise((resolve) => {
            const child = spawn('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--coverage', '--coverage-dir', '.'], {
                cwd: process.cwd()
            });

            let stderr = '';
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('exit', (code) => {
                if (code === 1 && stderr.includes('Security Error')) {
                    resolve(null);
                } else {
                    resolve(`Expected exit code 1 and security error message, but got code ${code} and stderr: ${stderr}`);
                }
            });
        });
    },

    'should block fixture traversal': async () => {
        try {
            assertFixture('../../../package.json', {});
            return 'Should have thrown a security error';
        } catch (e: any) {
            if (e.message.includes('Security Error')) {
                return null;
            }
            return `Expected Security Error, but got: ${e.message}`;
        }
    }
  }
});
