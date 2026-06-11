import test from '../../lib/test.js';
import { spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { assertFixture } from '../../lib/fixture-utils.js';

test({
    setup: () => {
        return { timeout: 60000 };
    },
    'Security Path Validation': {
        'should block unsafe --coverage-dir': () => {
            const result = spawnSync('npx', [
                'tsx',
                'src/bin/run-tests.ts',
                'src/test/examples',
                '--coverage',
                '--coverage-dir',
                '../outside'
            ], { encoding: 'utf8' });

            if (!result.stderr.includes('Security Error: Coverage directory \'../outside\' is outside the current working directory.')) {
                return `Expected security error for --coverage-dir, but got: ${result.stderr}`;
            }
            if (result.status !== 1) {
                return `Expected exit code 1, but got ${result.status}`;
            }
        },

        'should block unsafe --output': () => {
            const result = spawnSync('npx', [
                'tsx',
                'src/bin/run-tests.ts',
                'src/test/examples',
                '--reporter',
                'json',
                '--output',
                '/tmp/unsafe-output.json'
            ], { encoding: 'utf8' });

            if (!result.stderr.includes('Security Error: Output file \'/tmp/unsafe-output.json\' is outside the current working directory.')) {
                return `Expected security error for --output, but got: ${result.stderr}`;
            }
            if (result.status !== 1) {
                return `Expected exit code 1, but got ${result.status}`;
            }
        },

        'should block path traversal in fixtures': () => {
            try {
                assertFixture('../outside.json', { data: 1 });
                return 'Expected assertFixture to throw security error for path traversal';
            } catch (e: any) {
                if (!e.message.includes('Security Error: Fixture path \'../outside.json\' is invalid')) {
                    return `Unexpected error message: ${e.message}`;
                }
            }
        },

        'should block absolute paths in fixtures': () => {
            try {
                assertFixture('/etc/passwd', { data: 1 });
                return 'Expected assertFixture to throw security error for absolute path';
            } catch (e: any) {
                if (!e.message.includes('Security Error: Fixture path \'/etc/passwd\' is invalid')) {
                    return `Unexpected error message: ${e.message}`;
                }
            }
        }
    }
});
