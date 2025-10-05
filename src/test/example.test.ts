import { test } from '../index';
import { TestContext } from '../types';

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
  }
});