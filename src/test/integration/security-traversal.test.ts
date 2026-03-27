import { test } from '../../index.js';
import { readFixture } from '../../lib/fixture-utils.js';

test({
  'Security Traversal Test': {
    'should fail when attempting path traversal': async (): Promise<void> => {
      try {
        // Attempt to read package.json from the root
        // From dist/test/integration/ it should be ../../../package.json
        const data = readFixture('../../../package.json');
        if (data && data.name === 'cascade-test') {
          throw new Error('VULNERABILITY: Successfully read package.json via path traversal');
        }
      } catch (e: any) {
        if (e.message.includes('Security Error')) {
          return; // Success, it was blocked
        }
        throw e;
      }
    }
  }
});
