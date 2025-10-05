"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Example of using the test framework directly
const index_1 = require("./index");
(0, index_1.test)({
    setup: async () => {
        console.log('Setting up example...');
        return {
            startTime: Date.now(),
            testData: { value: 42 }
        };
    },
    teardown: async (context) => {
        if (context?.startTime && typeof context.startTime === 'number') {
            const duration = Date.now() - context.startTime;
            console.log(`Test completed in ${duration}ms`);
        }
    },
    'Basic Functionality': {
        'should handle simple assertions': (context) => {
            if (context?.testData?.value !== 42) {
                return 'Expected value to be 42';
            }
            return null;
        },
        'should handle async operations': async (context) => {
            // Simulate async work
            await new Promise(resolve => setTimeout(resolve, 50));
            if (context?.testData?.value && typeof context.testData.value === 'number' && context.testData.value * 2 !== 84) {
                return 'Math failed';
            }
            return null;
        }
    },
    'Error Handling': {
        'should report failures correctly': () => {
            return 'This test intentionally fails to demonstrate error reporting';
        },
        'should pass when no error is returned': () => {
            // No return value means success
        }
    },
    'Nested Context': {
        setup: async (parentContext) => {
            return {
                ...parentContext,
                nestedValue: parentContext?.testData?.value && typeof parentContext.testData.value === 'number' ? parentContext.testData.value + 1 : 1
            };
        },
        'should access nested context': (context) => {
            if (context?.nestedValue !== 43) {
                return `Expected 43, got ${context?.nestedValue}`;
            }
            return null;
        }
    }
});
//# sourceMappingURL=example-direct-usage.js.map