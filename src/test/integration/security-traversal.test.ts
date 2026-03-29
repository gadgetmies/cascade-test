
import { test } from '../../index.js';
import { assertFixture } from '../../lib/fixture-utils.js';
import * as path from 'path';
import * as os from 'os';

test({
  'Security: Path Traversal Prevention': {
    'should block directory traversal using ../': () => {
      try {
        assertFixture('../../../etc/passwd', { data: 'test' });
        return 'Should have thrown a Security Error';
      } catch (error: any) {
        if (error.message.includes('Security Error: Path traversal detected')) {
          return;
        }
        return `Unexpected error: ${error.message}`;
      }
    },

    'should block absolute paths': () => {
      const absPath = path.resolve(os.tmpdir(), 'test-fixture.json');
      try {
        assertFixture(absPath, { data: 'test' });
        return 'Should have thrown a Security Error';
      } catch (error: any) {
        if (error.message.includes('Security Error: Absolute paths are not allowed')) {
          return;
        }
        return `Unexpected error: ${error.message}`;
      }
    },

    'should block complex traversal patterns': () => {
        // Even if some systems allow different separators, path.join and path.relative should handle them.
        const complexPath = 'fixtures/../../etc/passwd';
        try {
          assertFixture(complexPath, { data: 'test' });
          return 'Should have thrown a Security Error';
        } catch (error: any) {
          if (error.message.includes('Security Error: Path traversal detected')) {
            return;
          }
          return `Unexpected error: ${error.message}`;
        }
      }
  }
});
