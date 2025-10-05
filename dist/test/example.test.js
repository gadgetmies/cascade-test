"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
(0, index_1.test)({
    setup: async () => {
        console.log('Setting up example tests...');
        return {
            testData: { value: 42 },
            timeout: 5000
        };
    },
    teardown: async (context) => {
        console.log('Cleaning up example tests...');
    },
    'Basic Tests': {
        'should pass simple assertion': (context) => {
            if (context?.testData?.value !== 42) {
                return 'Expected value to be 42';
            }
            return null;
        },
        'should handle async operations': async (context) => {
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 100));
            if (context?.testData?.value && typeof context.testData.value === 'number' && context.testData.value * 2 !== 84) {
                return 'Math failed';
            }
            return null;
        }
    },
    'Error Handling': {
        'should fail with custom error': () => {
            return 'This test intentionally fails';
        },
        'should pass when no error returned': () => {
            // No return value means test passes
        }
    },
    'Nested Suites': {
        setup: async (parentContext) => {
            return {
                ...parentContext,
                nestedData: 'nested'
            };
        },
        'should access nested context': (context) => {
            if (context?.nestedData !== 'nested') {
                return 'Nested context not available';
            }
            return null;
        }
    }
});
//# sourceMappingURL=example.test.js.map