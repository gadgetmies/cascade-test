interface ExampleTestContext {
  testData?: { value: number };
  timeout?: number;
  nestedData?: string;
}

describe('', () => {
  let globalContext: ExampleTestContext = {};

  beforeAll(async () => {
    console.log('Setting up example tests...');
    globalContext = {
      testData: { value: 42 },
      timeout: 5000,
    };
  });

  afterAll(async () => {
    console.log('Cleaning up example tests...');
  });

  describe('Basic Tests', () => {
    test('should pass simple assertion', () => {
      expect(globalContext.testData?.value).toBe(42);
    });

    test('should handle async operations', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const value = globalContext.testData?.value;
      expect(value).toBeDefined();
      expect(typeof value).toBe('number');
      expect(value! * 2).toBe(84);
    });
  });

  describe('Error Handling', () => {
    test('should fail with custom error', () => {
      throw new Error('This test intentionally fails');
    });

    test('should pass when no error returned', () => {
    });
  });

  describe('Nested Suites', () => {
    let nestedContext: ExampleTestContext = {};

    beforeAll(async () => {
      nestedContext = {
        ...globalContext,
        nestedData: 'nested',
      };
    });

    test('should access nested context', () => {
      expect(nestedContext.nestedData).toBe('nested');
    });
  });

  describe('Skip Examples', () => {
    test.skip('should be skipped', () => {
      throw new Error('This test should be skipped');
    });

    describe('Skipped Expired Skip', () => {
      test.skip('expired skip should be skipped because of the skip at the higher level', () => {
        throw new Error('This should be skipped because of the skip at the higher level');
      });
    });
  });
});

