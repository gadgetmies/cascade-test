import { test } from '../../index.js';
import { assertFixture } from '../../lib/fixture-utils.js';

export default test({
  'Path Traversal Prevention': {
    'should throw Security Error when attempting to traverse out of fixtures directory': () => {
      try {
        assertFixture('../traversal.json', { data: 'pwned' });
        return 'Should have thrown a Security Error';
      } catch (error: any) {
        if (error.message.includes('Security Error: Fixture path traversal detected')) {
          return null; // Passed
        }
        return `Unexpected error message: ${error.message}`;
      }
    },

    'should throw Security Error with absolute paths': () => {
      try {
        assertFixture('/tmp/traversal.json', { data: 'pwned' });
        return 'Should have thrown a Security Error';
      } catch (error: any) {
        if (error.message.includes('Security Error: Fixture path traversal detected')) {
          return null; // Passed
        }
        return `Unexpected error message: ${error.message}`;
      }
    },

    'should allow valid fixture names': () => {
        // This will try to read the file, but at least it should pass the traversal check
        try {
            assertFixture('valid-fixture.json', { data: 'ok' });
        } catch (error: any) {
            if (error.message.includes('Security Error')) {
                return `Should NOT have thrown a Security Error for valid path: ${error.message}`;
            }
            // Fixture not found is expected if it doesn't exist
            if (error.message.includes('Fixture not found')) {
                return null;
            }
            return `Unexpected error: ${error.message}`;
        }
        return null;
    }
  }
});
