import { test } from '../../index.js';
import { assertFixture, readFixture } from '../../lib/fixture-utils.js';
import { expect } from 'chai';

test({
  'Security: Path Traversal': {
    'should throw Security Error when attempting path traversal in assertFixture': () => {
      try {
        // This should throw a Security Error once fixed
        assertFixture('../../../package.json', {});
        return 'VULNERABLE: assertFixture allowed path traversal';
      } catch (error: any) {
        if (error.message.includes('Security Error')) {
          // Success: Path traversal was blocked
          return;
        }
        // If it's a different error, it might still be vulnerable or failed for other reasons
        if (error.message.includes('Fixture not found') || error.message.includes('Fixture mismatch')) {
             return 'VULNERABLE: assertFixture reached the file or its location: ' + error.message;
        }
        throw error;
      }
    },

    'should throw Security Error when attempting path traversal in readFixture': () => {
      try {
        readFixture('../../../package.json');
        return 'VULNERABLE: readFixture allowed path traversal';
      } catch (error: any) {
        if (error.message.includes('Security Error')) {
          // Success: Path traversal was blocked
          return;
        }
        if (error.message.includes('Fixture not found')) {
          return 'VULNERABLE: readFixture reached the file location: ' + error.message;
        }
        throw error;
      }
    }
  }
});
