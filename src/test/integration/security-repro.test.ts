import { assertFixture } from '../../lib/fixture-utils.js';
import test from '../../lib/test.js';

test({
  'should prevent path traversal in fixtureName': () => {
    const maliciousPath = '../../package.json';
    try {
      // This should fail with a Security Error
      assertFixture(maliciousPath, {});
      return 'Should have thrown a security error for path traversal';
    } catch (e: any) {
      if (e.message.includes('Security Error')) {
        return null; // Success, it's protected
      }
      return `Unexpected error: ${e.message}`;
    }
  }
});
