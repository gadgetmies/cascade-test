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
      await new Promise(resolve => setTimeout(resolve, 100));
      if (context?.testData?.value && typeof context.testData.value === 'number' && context.testData.value * 2 !== 84) {
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
    setup: async (): Promise<TestContext> => {
      return {
        originalData: "original",
      };
    },
    "with modified context": {
      setup: async (parentContext?: TestContext): Promise<TestContext> => {
        return {
          ...parentContext,
          nestedData: "nested",
        };
      },
      "should access nested context": (context?: TestContext): string | void => {
        if (context?.originalData !== "original") {
          return "Original context not available";
        }
        if (context?.nestedData !== "nested") {
          return "Nested context not available";
        }
      },
    },
  },

  'Skip Examples': {
    skip: () => {
      return {
        reason: 'Feature not implemented yet',
        until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
    },

    'should be skipped': (): string => {
      return 'This test should be skipped';
    },

    'Skipped Expired Skip': {
      skip: () => {
        return {
          reason: 'Test nested expired skip',
          until: '2026-12-31'
        };
      },

      'expired skip should be skipped because of the skip at the higher level': (): string => {
        return 'This should be skipped because of the skip at the higher level';
      }
    }
  },

  'Expired Skip': {
    skip: () => {
      return {
        reason: 'This skip has expired',
        until: '2026-12-31'
      };
    },

    'should fail due to expired skip': (): string => {
      return 'This test should fail due to expired skip';
    }
  }
});

