import { assertFixture, createFixture, readFixture } from '../../lib/fixture-utils.js';
import * as path from 'path';
import * as fs from 'fs';
import { test } from '../../index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test({
  'Security: should prevent path traversal in fixtureName': () => {
    const maliciousPath = '../../trap.json';
    const secretData = { secret: 'sensitive info' };

    // fixtureDir will be __dirname + '/fixtures'
    // so ../../trap.json will be __dirname + '/fixtures/../../trap.json' => __dirname + '/../trap.json'
    // which is src/test/trap.json

    const expectedTrapPath = path.resolve(__dirname, '..', 'trap.json');

    if (fs.existsSync(expectedTrapPath)) {
        fs.unlinkSync(expectedTrapPath);
    }

    try {
      // Attempt to write outside the fixtures directory
      createFixture(maliciousPath, secretData);

      if (fs.existsSync(expectedTrapPath)) {
        fs.unlinkSync(expectedTrapPath);
        return 'Vulnerability: Successfully wrote file outside fixtures directory at ' + expectedTrapPath;
      } else {
          // Let's see where it actually went if not there
          const fixtureDir = path.resolve(__dirname, 'fixtures');
          const actualPath = path.join(fixtureDir, maliciousPath);
          if (fs.existsSync(actualPath)) {
              fs.unlinkSync(actualPath);
              return 'Vulnerability: Successfully wrote file outside fixtures directory at ' + actualPath;
          }
      }
    } catch (e: any) {
      if (e.message.includes('Security Error')) {
        return null; // Passed (blocked)
      }
      return 'Expected Security Error, but got: ' + e.message;
    }

    return 'Vulnerability: createFixture did not throw and did not create file at expected locations!';
  }
});
