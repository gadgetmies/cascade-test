import { test } from '../../index.js';
import { TestContext } from '../../types.js';
import { spawnSync } from 'child_process';
import { expect } from 'chai';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');
const runTestsScript = path.resolve(rootDir, 'src/bin/run-tests.ts');

test({
  setup: async (): Promise<TestContext> => ({}),

  'Security: Path Validation': {
    'should block coverage directory outside CWD': (): void => {
      const unsafeDir = '/tmp/unsafe-coverage';
      const result = spawnSync('npx', [
        'tsx',
        runTestsScript,
        'src/test/examples',
        '--coverage',
        '--coverage-dir',
        unsafeDir,
        '--regex',
        'non-existent'
      ], { encoding: 'utf8', cwd: rootDir });

      expect(result.stderr).to.include('Security Error: Coverage directory');
      expect(result.status).to.equal(1);
    },

    'should block coverage directory being CWD': (): void => {
      const result = spawnSync('npx', [
        'tsx',
        runTestsScript,
        'src/test/examples',
        '--coverage',
        '--coverage-dir',
        '.',
        '--regex',
        'non-existent'
      ], { encoding: 'utf8', cwd: rootDir });

      expect(result.stderr).to.include('Security Error: Coverage directory');
      expect(result.status).to.equal(1);
    },

    'should block output file outside CWD': (): void => {
      const unsafeOutput = '/tmp/unsafe-output.json';
      const result = spawnSync('npx', [
        'tsx',
        runTestsScript,
        'src/test/examples',
        '--reporter',
        'json',
        '--output',
        unsafeOutput,
        '--regex',
        'example.test.ts'
      ], { encoding: 'utf8', cwd: rootDir });

      expect(result.stderr).to.include('Security Error: Output file path');
      // The process doesn't exit with 1 for reporter errors, but it logs to stderr
    },

    'should block output file being CWD': (): void => {
      const result = spawnSync('npx', [
        'tsx',
        runTestsScript,
        'src/test/examples',
        '--reporter',
        'json',
        '--output',
        '.',
        '--regex',
        'example.test.ts'
      ], { encoding: 'utf8', cwd: rootDir });

      expect(result.stderr).to.include('Security Error: Output file path');
    }
  }
});
