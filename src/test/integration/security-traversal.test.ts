import test from '../../lib/test.js';
import { readFixture, createFixture } from '../../lib/fixture-utils.js';
import * as fs from 'fs';
import * as path from 'path';

test({
  'Path Traversal Vulnerability Test': {
    'should NOT be able to read files outside fixtures directory': () => {
      try {
        // Try to read a file outside the fixtures directory
        // Starting from src/test/integration/fixtures:
        // ../../../../README.md should reach the root README.md
        const data = readFixture('../../../../README.md', {
            deserializer: (d) => d // just return raw string
        });
        if (data && typeof data === 'string' && data.includes('Cascade Test')) {
          return 'VULNERABILITY: Successfully read README.md via path traversal';
        }
      } catch (error: any) {
        if (error.message.includes('Access denied')) {
            // This is what we want after the fix
            return;
        }
        return `Unexpected error: ${error.message}`;
      }
      return 'VULNERABILITY: readFixture did not throw and did not return expected data, but path traversal was not blocked';
    }
  }
});
