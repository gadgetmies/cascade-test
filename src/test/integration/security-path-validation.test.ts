import { test } from '../../index.js';
import { assertFixture } from '../../lib/fixture-utils.js';
import { spawnSync } from 'child_process';
import * as path from 'path';

test({
  'Security: Path Validation': {
    'CLI: should block unsafe coverage directory': () => {
      const result = spawnSync('npx', [
        'tsx',
        'src/bin/run-tests.ts',
        'src/test/examples',
        '--coverage',
        '--coverage-dir',
        '..'
      ], { encoding: 'utf8' });

      if (!result.stderr.includes('Security Error')) {
        return 'Expected security error for unsafe coverage directory, but it was not found.';
      }
    },

    'CLI: should block unsafe output file': () => {
      const result = spawnSync('npx', [
        'tsx',
        'src/bin/run-tests.ts',
        'src/test/examples',
        '--reporter', 'json',
        '--output', '../unsafe.json'
      ], { encoding: 'utf8' });

      if (!result.stderr.includes('Security Error')) {
        return 'Expected security error for unsafe output file, but it was not found.';
      }
    },

    'FixtureUtils: should block traversal in fixture name': () => {
      try {
        assertFixture('../../../evil.json', {});
        return 'Expected error for traversal in fixture name, but none was thrown.';
      } catch (e: any) {
        if (!e.message.includes('Security Error')) {
          return `Expected security error, but got: ${e.message}`;
        }
      }
    },

    'FixtureUtils: should block absolute path in fixture name': () => {
      try {
        assertFixture('/tmp/evil.json', {});
        return 'Expected error for absolute path in fixture name, but none was thrown.';
      } catch (e: any) {
        if (!e.message.includes('Security Error')) {
          return `Expected security error, but got: ${e.message}`;
        }
      }
    }
  }
});
