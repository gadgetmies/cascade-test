import { test } from '../../index.js';
import { TestContext } from '../../types.js';
test({
  'Basic Tests': {
    'should pass simple assertion': () => {},
    'should handle async operations': async () => {}
  },
  'Error Handling': {
    'should fail with custom error': () => 'This test intentionally fails',
    'should pass when no error returned': () => {}
  },
  'Nested Suites': {
    'with modified context': {
      setup: async (): Promise<TestContext> => ({ originalData: 'original', nestedData: 'nested' }),
      'should access nested context': (c?: TestContext): string | void => {
        if (c?.originalData !== 'original' || c?.nestedData !== 'nested') return 'Error';
      }
    }
  },
  'Skip Examples': {
    skip: () => ({ reason: 'S', until: new Date(Date.now() + 1e9) }),
    'should be skipped': () => 'E',
    'Skipped Expired Skip': {
      skip: () => ({ reason: 'S', until: '2024-01-01' }),
      'expired skip should be skipped because of the skip at the higher level': () => 'E'
    }
  },
  'Expired Skip': {
    skip: () => ({ reason: 'This skip has expired', until: '2024-01-01' }),
    'f': () => 'E'
  }
});
