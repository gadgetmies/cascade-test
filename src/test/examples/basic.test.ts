import { test } from '../../index.js';
import { TestContext } from '../../types.js';

test({
  setup: async (): Promise<TestContext> => {
    console.log('Setting up basic tests...');
    return { 
      testData: { value: 42 },
      timeout: 5000 
    };
  },

  teardown: async (context?: TestContext): Promise<void> => {
    console.log('Cleaning up basic tests...');
  },

  'Basic Tests': {
    'should pass simple assertion': (context?: TestContext): string | void => {
      if (context?.testData?.value !== 42) {
        return 'Expected value to be 42';
      }
    },

    'should handle async operations': async (context?: TestContext): Promise<string | void> => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      if (context?.testData?.value && typeof context.testData.value === 'number' && context.testData.value * 2 !== 84) {
        return 'Math failed';
      }
    }
  }
});
