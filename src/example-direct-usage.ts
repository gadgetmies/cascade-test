// Example of using the test framework directly
import { test } from './index.js';
import { TestContext } from './types.js';

test({
  setup: async (): Promise<TestContext> => {
    console.log('Setting up example...');
    return { 
      startTime: Date.now(),
      testData: { value: 42 }
    };
  },

  teardown: async (context?: TestContext): Promise<void> => {
    if (context?.startTime && typeof context.startTime === 'number') {
      const duration = Date.now() - context.startTime;
      console.log(`Test completed in ${duration}ms`);
    }
  },

  'Basic Functionality': {
    'should handle simple assertions': (context?: TestContext): string | null => {
      if (context?.testData?.value !== 42) {
        return 'Expected value to be 42';
      }
      return null;
    },

    'should handle async operations': async (context?: TestContext): Promise<string | null> => {
      // Simulate async work
      await new Promise(resolve => setTimeout(resolve, 50));
      if (context?.testData?.value && typeof context.testData.value === 'number' && context.testData.value * 2 !== 84) {
        return 'Math failed';
      }
      return null;
    }
  },

  'Error Handling': {
    'should report failures correctly': (): string => {
      return 'This test intentionally fails to demonstrate error reporting';
    },

    'should pass when no error is returned': (): void => {
      // No return value means success
    }
  },

  'Nested Context': {
    setup: async (parentContext?: TestContext): Promise<TestContext> => {
      return {
        ...parentContext,
        nestedValue: parentContext?.testData?.value && typeof parentContext.testData.value === 'number' ? parentContext.testData.value + 1 : 1
      };
    },

    'should access nested context': (context?: TestContext): string | null => {
      if (context?.nestedValue !== 43) {
        return `Expected 43, got ${context?.nestedValue}`;
      }
      return null;
    }
  },

  'Skip Examples': {
    skip: () => {
      // This test will be skipped until a future date
      return {
        reason: 'Feature under development',
        until: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      };
    },

    'should be skipped': (): string | null => {
      return 'This test should be skipped';
    }
  }
});