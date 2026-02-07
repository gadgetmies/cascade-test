import { test } from '../../index.js';
import { TestContext } from '../../types.js';

test({
  setup: async (): Promise<TestContext> => {
    console.log('Setting up example tests...');
    return {
      testData: { value: 42 },
      timeout: 5000
    };
  },

  teardown: async (context?: TestContext): Promise<void> => {
    console.log('Cleaning up example tests...');
  },

  'Basic Tests': {
    'should pass simple assertion': (context?: TestContext): string | void => {
      if (context?.testData?.value !== 42) {
        return 'Expected value to be 42';
      }
    },

    'should handle async operations': async (context?: TestContext): Promise<string | void> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const value = context?.testData?.value;
      if (value !== 42) {
        return 'Math failed';
      }
    }
  },

  'Error Handling': {
    'should fail with custom error': (): string => {
      return 'This test intentionally fails';
    },

    'should pass when no error returned': (): void => {
    }
  },

  'Nested Suites': {
    setup: async (parentContext?: TestContext): Promise<TestContext> => {
      return {
        ...parentContext,
        nestedData: 'nested',
      };
    },
    'should access nested context': (context?: TestContext): string | void => {
      if (context?.nestedData !== 'nested') {
        return 'Nested context not available';
      }
    }
  },

  'Skip Examples': {
    skip: () => ({
      reason: 'Feature not implemented yet',
      until: '2099-01-01'
    }),

    'should be skipped': (): string => {
      return 'This test should be skipped';
    },

    'Skipped Expired Skip': {
      skip: () => ({
        reason: 'Test nested expired skip',
        until: '2024-01-01'
      }),

      'expired skip should be skipped because of the skip at the higher level': (): string => {
        return 'This should be skipped because of the skip at the higher level';
      }
    }
  },

  'Expired Skip': {
    setup: () => {
      throw new Error('This skip has expired');
    }
  }
});
