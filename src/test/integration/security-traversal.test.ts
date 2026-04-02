import { test } from '../../index.js';
import { createFixture, readFixture, assertFixture } from '../../lib/fixture-utils.js';
import * as path from 'path';
import * as os from 'os';

test({
  'Security: Path Traversal Protection': {
    'should block absolute paths': () => {
      const absolutePath = path.resolve(os.tmpdir(), 'malicious-fixture.json');
      try {
        createFixture(absolutePath, { data: 'stolen' });
        return 'Should have thrown a Security Error for absolute path';
      } catch (error: any) {
        if (error.message.includes('Security Error')) {
          return;
        }
        return `Expected Security Error, but got: ${error.message}`;
      }
    },

    'should block parent directory traversal (..)': () => {
      const traversalPath = '../../../package.json';
      try {
        readFixture(traversalPath);
        return 'Should have thrown a Security Error for path traversal';
      } catch (error: any) {
        if (error.message.includes('Security Error')) {
          return;
        }
        return `Expected Security Error, but got: ${error.message}`;
      }
    },

    'should block traversal via nested directories': () => {
      const complexTraversal = 'nested/../../../../etc/passwd';
      try {
        assertFixture(complexTraversal, {});
        return 'Should have thrown a Security Error for nested path traversal';
      } catch (error: any) {
        if (error.message.includes('Security Error')) {
          return;
        }
        return `Expected Security Error, but got: ${error.message}`;
      }
    },

    'should allow legitimate subdirectories': () => {
      try {
        const fixtureName = 'subdir/valid.json';
        const data = { valid: true };
        const fixturePath = createFixture(fixtureName, data);

        if (!fixturePath.includes('fixtures/subdir/valid.json')) {
           return `Fixture path seems incorrect: ${fixturePath}`;
        }

        const readData = readFixture(fixtureName);
        if (JSON.stringify(readData) !== JSON.stringify(data)) {
           return 'Data mismatch in legitimate subdirectory fixture';
        }
        return;
      } catch (error: any) {
        return `Should NOT have thrown an error for legitimate subdirectory: ${error.message}`;
      }
    }
  }
});
