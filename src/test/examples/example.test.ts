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
    'should pass simple assertion': (context?: TestContext): string | null => {
      if (context?.testData?.value !== 42) {
        return 'Expected value to be 42';
      }
      return null;
    },

    'should handle async operations': async (context?: TestContext): Promise<string | null> => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      if (context?.testData?.value && typeof context.testData.value === 'number' && context.testData.value * 2 !== 84) {
        return 'Math failed';
      }
      return null;
    }
  },

  'Error Handling': {
    'should fail with custom error': (): string => {
      return 'This test intentionally fails';
    },

    'should pass when no error returned': (): void => {
      // No return value means test passes
    }
  },

  'Nested Suites': {
    setup: async (parentContext?: TestContext): Promise<TestContext> => {
      return { 
        ...parentContext,
        nestedData: 'nested'
      };
    },

    'should access nested context': (context?: TestContext): string | null => {
      if (context?.nestedData !== 'nested') {
        return 'Nested context not available';
      }
      return null;
    }
  },

  'Skip Examples': {
    skip: () => {
      // This test will be skipped until a future date
      return {
        reason: 'Feature not implemented yet',
        until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };
    },

    'should be skipped': (): string | null => {
      return 'This test should be skipped';
    },

    'Skipped Expired Skip': {
      skip: () => {
        return {
          reason: 'Test nested expired skip',
          until: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        };
      },

      'expired skip should be skipped because of the skip at the higher level': (): string | null => {
        return 'This should be skipped because of the skip at the higher level';
      }
    }
  },

  'Expired Skip': {
    skip: () => {
      // This test will fail because the skip date is in the past
      return {
        reason: 'This skip has expired',
        until: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      };
    },

    'should fail due to expired skip': (): string | null => {
      return 'This test should fail due to expired skip';
    }
  }
});