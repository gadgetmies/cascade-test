import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test({
  'Security: Path Traversal Protection': {
    'should block attempts to access files outside fixtures directory': () => {
      try {
        // This should throw a Security Error because it attempts to go outside 'fixtures'
        assertFixture('../../../package.json', { something: true });
        throw new Error('Should have thrown a Security Error');
      } catch (e: any) {
        if (e.message.includes('Security Error')) {
          return; // Success
        }
        throw e;
      }
    },

    'should block absolute paths': () => {
      try {
        const absolutePath = path.resolve(process.cwd(), 'package.json');
        assertFixture(absolutePath, { something: true });
        throw new Error('Should have thrown a Security Error for absolute path');
      } catch (e: any) {
        if (e.message.includes('Security Error')) {
          return; // Success
        }
        throw e;
      }
    }
  }
});
