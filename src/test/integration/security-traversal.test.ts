import { test } from '../../index.js';
import { spawnSync } from 'child_process';
import * as fs from 'fs';

export default test({
    'Coverage Directory Security': {
        'should block coverage directory outside CWD': (): void => {
            const result = spawnSync('node', ['dist/bin/run-tests.js', 'src/test/integration', '--coverage', '--coverage-dir', '/tmp/unsafe-coverage', '--regex', 'framework.test.ts'], {
                encoding: 'utf8'
            });

            if (!result.stderr.includes('Security Error: Coverage directory \'/tmp/unsafe-coverage\' is outside the current working directory or points to it.')) {
                throw new Error(`Expected security error for /tmp/unsafe-coverage, but got: ${result.stderr}`);
            }
        },

        'should block coverage directory pointing to CWD': (): void => {
            const result = spawnSync('node', ['dist/bin/run-tests.js', 'src/test/integration', '--coverage', '--coverage-dir', '.', '--regex', 'framework.test.ts'], {
                encoding: 'utf8'
            });

            if (!result.stderr.includes('Security Error: Coverage directory \'.\' is outside the current working directory or points to it.')) {
                throw new Error(`Expected security error for '.', but got: ${result.stderr}`);
            }
        },

        'should block coverage directory using traversal to go outside CWD': (): void => {
            const result = spawnSync('node', ['dist/bin/run-tests.js', 'src/test/integration', '--coverage', '--coverage-dir', '../../tmp', '--regex', 'framework.test.ts'], {
                encoding: 'utf8'
            });

            if (!result.stderr.includes('Security Error: Coverage directory \'../../tmp\' is outside the current working directory or points to it.')) {
                throw new Error(`Expected security error for '../../tmp', but got: ${result.stderr}`);
            }
        },

        'should allow safe coverage directory': (): void => {
            const safeDir = 'safe-coverage-test';
            const result = spawnSync('node', ['dist/bin/run-tests.js', 'src/test/integration', '--coverage', '--coverage-dir', safeDir, '--regex', 'framework.test.ts'], {
                encoding: 'utf8'
            });

            if (result.status !== 0) {
                throw new Error(`Expected success for safe coverage directory, but failed with status ${result.status}: ${result.stderr}`);
            }

            if (!fs.existsSync(safeDir)) {
                throw new Error(`Expected coverage directory '${safeDir}' to be created`);
            }

            // Cleanup
            fs.rmSync(safeDir, { recursive: true, force: true });
        }
    }
});
