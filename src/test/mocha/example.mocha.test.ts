import { describe, it, before, after } from 'mocha';
import { strict as assert } from 'assert';

interface TestContext {
  testData?: { value: number };
  timeout?: number;
  nestedData?: string;
}

let globalContext: TestContext = {};

describe('', function () {
  before(async function () {
    console.log('Setting up example tests...');
    globalContext = {
      testData: { value: 42 },
      timeout: 5000,
    };
  });

  after(async function () {
    console.log('Cleaning up example tests...');
  });

  describe('Basic Tests', function () {
    it('should pass simple assertion', function () {
      assert.equal(globalContext.testData?.value, 42, 'Expected value to be 42');
    });

    it('should handle async operations', async function () {
      await new Promise(resolve => setTimeout(resolve, 100));
      const value = globalContext.testData?.value;
      assert.ok(value !== undefined && typeof value === 'number', 'Value should be a number');
      assert.equal(value * 2, 84, 'Math failed');
    });
  });

  describe('Error Handling', function () {
    it('should fail with custom error', function () {
      throw new Error('This test intentionally fails');
    });

    it('should pass when no error returned', function () {
    });
  });

  describe('Nested Suites', function () {
    let nestedContext: TestContext = {};

    before(async function () {
      nestedContext = {
        ...globalContext,
        nestedData: 'nested',
      };
    });

    it('should access nested context', function () {
      assert.equal(nestedContext.nestedData, 'nested', 'Nested context not available');
    });
  });

  describe('Skip Examples', function () {
    it.skip('should be skipped', function () {
      throw new Error('This test should be skipped');
    });

    describe('Skipped Expired Skip', function () {
      it.skip('expired skip should be skipped because of the skip at the higher level', function () {
        throw new Error('This should be skipped because of the skip at the higher level');
      });
    });
  });
});

