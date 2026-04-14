import { assertFixture } from '../../lib/fixture-utils.js';
import { test } from '../../index.js';

test({
  'Security: Path Traversal Protection': {
    'should block attempts to access files outside the fixtures directory': () => {
      try {
        process.env['UPDATE_FIXTURES'] = 'true';
        // This should throw a Security Error once fixed
        assertFixture('../../../package.json', {});
        return 'FAILED: Should have blocked path traversal';
      } catch (e) {
        if (e.message.includes('Security Error') || e.message.includes('traversal detected')) {
          return null; // Test passed, security error caught
        }
        // If it's still the old error or no error, it's not fixed yet
        if (e.message.includes('Fixture mismatch')) {
             // In current vulnerable state, it might actually write to package.json if we are not careful
             // but here it might just mismatch because we passed {} and package.json is not {}.
             return 'VULNERABLE: Fixture mismatch instead of Security Error';
        }
        return `Unexpected error: ${e.message}`;
      }
    }
  }
});
