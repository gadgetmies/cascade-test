
import { test } from '../../index.js';

test({
  'Basic Tests': {
    'should pass simple assertion': () => {},
    'should handle async operations': async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  },

  'Error Handling': {
    'should fail with custom error': () => {
      return 'This test intentionally fails';
    },
    'should pass when no error returned': () => {}
  },

  'Nested Suites': {
    'with modified context': {
      'should access nested context': () => {}
    }
  },

  'Skip Examples': {
    skip: () => ({ reason: 'Test skipped', until: '2030-12-31' }),
    'should be skipped': () => {},
    'Skipped Expired Skip': {
      'expired skip should be skipped because of the skip at the higher level': () => {}
    }
  },

  'Expired Skip': {
    skip: () => ({ reason: 'This skip has expired', until: '2024-01-01' }),
    'should fail': () => {}
  }
});
