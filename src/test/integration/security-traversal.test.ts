
import { assertFixture, createFixture, readFixture } from '../../lib/fixture-utils.js';
import { test } from '../../index.js';

test({
  'Security: should prevent path traversal in assertFixture': () => {
    try {
      assertFixture('../../../package.json', {});
      return 'Should have thrown a Security Error';
    } catch (error: any) {
      if (error.message.includes('Security Error: Path traversal attempt detected')) {
        return;
      }
      return `Unexpected error message: ${error.message}`;
    }
  },

  'Security: should prevent absolute paths in createFixture': () => {
    try {
      createFixture('/tmp/dangerous.json', {});
      return 'Should have thrown a Security Error';
    } catch (error: any) {
      if (error.message.includes('Security Error: Absolute paths are not allowed for fixtures')) {
        return;
      }
      return `Unexpected error message: ${error.message}`;
    }
  },

  'Security: should prevent path traversal in readFixture': () => {
    try {
      readFixture('../../../README.md');
      return 'Should have thrown a Security Error';
    } catch (error: any) {
      if (error.message.includes('Security Error: Path traversal attempt detected')) {
        return;
      }
      return `Unexpected error message: ${error.message}`;
    }
  }
});
