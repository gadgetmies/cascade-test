import { test } from '../../index.js';
import { assertFixture } from '../../lib/fixture-utils.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default test({
  setup: () => {
    const trapPath = path.join(__dirname, 'trap.json');
    fs.writeFileSync(trapPath, JSON.stringify({ secret: 'trap' }));
    return { trapPath };
  },

  teardown: (context: any) => {
    if (fs.existsSync(context.trapPath)) {
      fs.unlinkSync(context.trapPath);
    }
  },

  'should throw Security Error when attempting path traversal': () => {
    try {
      // This attempts to access src/test/integration/trap.json
      // via src/test/integration/fixtures/../trap.json
      assertFixture('../trap.json', { secret: 'trap' });
      return 'FAILED: assertFixture allowed path traversal';
    } catch (error: any) {
      if (error.message.includes('Security Error')) {
        return null; // Passed: Fix is working
      }
      // If it throws another error (like 'Fixture not found'), it still didn't throw Security Error
      return `FAILED: Expected 'Security Error' but got: ${error.message}`;
    }
  }
});
