import { test } from '../../index.js';

// Reproduction test for summary colors
// It should have:
// 1 passed test
// 1 failed test
// 1 skipped test

test({
  'Summary Color Test': {
    'should pass': () => {
      // Pass
    },
    'should fail': () => {
      throw new Error('Intentional Failure');
    },
    'Skipped Suite': {
      skip: () => ({ reason: 'Intentional Skip', until: '2030-01-01' }),
      'should skip': () => {
        // Skipped
      }
    }
  }
});
