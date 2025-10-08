import { test } from '../../index.js';

test({
  'Error Handling': {
    'should fail with custom error': (): string => {
      return 'This test intentionally fails';
    },

    'should pass when no error returned': (): void => {
      // No return value means test passes
    },

    'should fail with uncaught exception': (): void => {
      throw new Error('This test intentionally fails');
    }
  }
});
