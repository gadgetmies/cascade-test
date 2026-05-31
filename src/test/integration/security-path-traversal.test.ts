import { test } from '../../index.js';
import { assertFixture } from '../../lib/fixture-utils.js';

test({
  'Security': {
    'blocks traversal': () => {
      try {
        assertFixture('../../../package.json', {});
        return 'Fail';
      } catch (e: any) {
        return e.message.includes('Security Error') ? null : e.message;
      }
    }
  }
});
