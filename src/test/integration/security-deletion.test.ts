import { spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export default {
    setup: () => {
        const testDir = path.join(os.tmpdir(), `cascade-security-test-${Date.now()}`);
        fs.mkdirSync(testDir, { recursive: true });

        const dummyTest = path.join(testDir, 'dummy.test.ts');
        fs.writeFileSync(dummyTest, "export default { 'should pass': () => null };");

        return { testDir };
    },

    teardown: (context: any) => {
        if (fs.existsSync(context.testDir)) {
            fs.rmSync(context.testDir, { recursive: true, force: true });
        }
    },

    'Security: Coverage Directory Deletion Protection': {
        'should block absolute paths': (context: any) => {
            const absolutePath = path.join(os.tmpdir(), 'forbidden-coverage');
            const result = spawnSync('npx', [
                'tsx',
                'src/bin/run-tests.ts',
                context.testDir,
                '--coverage',
                '--coverage-dir',
                absolutePath
            ], { encoding: 'utf8' });

            if (!result.stderr.includes('Security Error')) {
                return `Expected security error for absolute path ${absolutePath}, but got: ${result.stderr}`;
            }
        },

        'should block parent directory paths': (context: any) => {
            const result = spawnSync('npx', [
                'tsx',
                'src/bin/run-tests.ts',
                context.testDir,
                '--coverage',
                '--coverage-dir',
                '../unsafe'
            ], { encoding: 'utf8' });

            if (!result.stderr.includes('Security Error')) {
                return `Expected security error for parent directory path, but got: ${result.stderr}`;
            }
        },

        'should block current working directory': (context: any) => {
            const result = spawnSync('npx', [
                'tsx',
                'src/bin/run-tests.ts',
                context.testDir,
                '--coverage',
                '--coverage-dir',
                '.'
            ], { encoding: 'utf8' });

            if (!result.stderr.includes('Security Error')) {
                return `Expected security error for current working directory, but got: ${result.stderr}`;
            }
        },

        'should allow valid subdirectories': (context: any) => {
            const validDir = 'safe-coverage-dir';
            const result = spawnSync('npx', [
                'tsx',
                'src/bin/run-tests.ts',
                context.testDir,
                '--coverage',
                '--coverage-dir',
                validDir
            ], { encoding: 'utf8' });

            // Clean up the created directory if it was successful
            const resolvedValidDir = path.join(process.cwd(), validDir);
            if (fs.existsSync(resolvedValidDir)) {
                fs.rmSync(resolvedValidDir, { recursive: true, force: true });
            }

            if (result.stderr.includes('Security Error')) {
                return `Expected valid subdirectory ${validDir} to be allowed, but got security error: ${result.stderr}`;
            }
        }
    }
};
