import { test } from '../../index.js';
import { assertFixture } from '../../lib/fixture-utils.js';
import * as fs from 'fs';
import * as path from 'path';

export default test({
  'should throw Security Error on path traversal': () => {
    const traversalPath = '../../../security-traversal-test.txt';
    try {
      assertFixture(traversalPath, { test: true });
      return 'FAILED: assertFixture allowed path traversal';
    } catch (error: any) {
      if (error.message.includes('Security Error')) {
        return; // PASSED: This is what we want after the fix
      }
      // Currently it might throw "Fixture not found" because the file doesn't exist at the traversed path
      // This still indicates that it tried to access the traversed path.
      return `FAILED: Expected Security Error, but got: ${error.message}`;
    }
  },

  'should throw Security Error on absolute path': () => {
    const absolutePath = path.resolve('/tmp/security-absolute-test.txt');
    try {
      assertFixture(absolutePath, { test: true });
      return 'FAILED: assertFixture allowed absolute path';
    } catch (error: any) {
      if (error.message.includes('Security Error')) {
        return; // PASSED
      }
      return `FAILED: Expected Security Error, but got: ${error.message}`;
    }
  }
});
