import { test } from '../../index.js';
import { readFixture, createFixture } from '../../lib/fixture-utils.js';

test({
  'Security: Path Traversal': {
    'readFixture should throw Access denied for path traversal': () => {
      try {
        // package.json is 4 levels up from src/test/integration/fixtures
        readFixture('../../../../package.json');
        return 'VULNERABILITY: readFixture allowed path traversal';
      } catch (e: any) {
        if (e.message.includes('Access denied')) {
          return undefined; // Passed (fixed)
        }
        // If it throws "Fixture not found", it's still vulnerable because it tried to access it
        if (e.message.includes('Fixture not found')) {
            return 'VULNERABILITY: readFixture tried to access file outside fixtures directory';
        }
        return `Unexpected error: ${e.message}`;
      }
    },
    'createFixture should throw Access denied for path traversal': () => {
      try {
        createFixture('../../../../evil.json', { evil: true });
        return 'VULNERABILITY: createFixture allowed path traversal';
      } catch (e: any) {
        if (e.message.includes('Access denied')) {
          return undefined; // Passed (fixed)
        }
        return `Unexpected error: ${e.message}`;
      }
    },
    'readFixture should throw Access denied for absolute paths': () => {
      try {
        readFixture('/etc/passwd');
        return 'VULNERABILITY: readFixture allowed absolute path';
      } catch (e: any) {
        if (e.message.includes('Access denied')) {
          return undefined; // Passed (fixed)
        }
        if (e.message.includes('Fixture not found')) {
            return 'VULNERABILITY: readFixture tried to access absolute path';
        }
        return `Unexpected error: ${e.message}`;
      }
    }
  }
});
