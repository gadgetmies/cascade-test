import { test } from '../../index.js';
import { TestContext, TestResult } from '../../types.js';
import { runTestFile } from '../../lib/test-utils.js';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { expect } from 'chai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripAnsi = (str: string): string => str.replace(/\x1b\[[0-9;]*m/g, '');

test({
  setup: async (): Promise<TestContext> => {
    console.log('Setting up framework tests...');
    return { timeout: 30000 };
  },

  teardown: async (): Promise<void> => {
    console.log('Cleaning up framework tests...');
  },

  'Framework Tests': {
    'should run example.test.ts and get expected results': async (): Promise<void> => {
      const exampleTestPath = path.resolve(__dirname, '../examples/example.test.ts');
      
      if (!fs.existsSync(exampleTestPath)) {
        throw new Error(`Test file not found: ${exampleTestPath}`);
      }

      const result = await runTestFile(exampleTestPath);

      expect(result.summary, 'Failed to get test summary from example.test.ts').to.exist;

      const expectedTotalTests = 8;
      const expectedPassedTests = 4;
      const expectedFailedTests = 1;
      const expectedSkippedTests = 3;

      const actualTotal = result.summary!.total;
      const actualPassed = result.summary!.passed;
      const actualFailed = result.summary!.failed;
      const actualSkipped = result.summary!.skipped;

      expect(actualTotal).to.equal(expectedTotalTests, `Expected ${expectedTotalTests} total tests, but got ${actualTotal}`);
      expect(actualPassed).to.equal(expectedPassedTests, `Expected ${expectedPassedTests} passed tests, but got ${actualPassed}`);
      expect(actualFailed).to.equal(expectedFailedTests, `Expected ${expectedFailedTests} failed tests, but got ${actualFailed}`);
      expect(actualSkipped).to.equal(expectedSkippedTests, `Expected ${expectedSkippedTests} skipped tests, but got ${actualSkipped}`);

      const failedTests = result.summary!.failedTests;
      const expectedFailuresInResults = ['should fail with custom error'];
      const expectedFailuresInFailedTests = [
        'Error Handling'
      ];

      for (const expectedFailure of expectedFailuresInFailedTests) {
        const found = failedTests.some((test: { path: string[]; error: string }) => 
          test.path.some((segment: string) => segment.includes(expectedFailure))
        );
        
        expect(found, `Expected to find failed test path containing: "${expectedFailure}"`).to.be.true;
      }
      
      expect(failedTests.length).to.equal(1, `Expected 1 items in failedTests array, but got ${failedTests.length}`);

      expect(result.code).to.equal(1, `Expected exit code 1 (because tests have intentional failures), but got ${result.code}`);
    },

    'should validate specific test outputs': async (): Promise<void> => {
      const exampleTestPath = path.resolve(__dirname, '../examples/example.test.ts');
      
      if (!fs.existsSync(exampleTestPath)) {
        throw new Error(`Test file not found: ${exampleTestPath}`);
      }

      const result = await runTestFile(exampleTestPath);

      expect(result.summary, 'Failed to get test summary').to.exist;

      const passedTests = result.summary!.results.filter((r: TestResult) => r.status === 'passed');

      const expectedPassedTests = [
        'should pass simple assertion',
        'should handle async operations',
        'should pass when no error returned',
        'should access nested context'
      ];

      for (const expectedTest of expectedPassedTests) {
        const found = passedTests.some((test: TestResult) => test.name === expectedTest);
        expect(found, `Expected to find passed test: "${expectedTest}"`).to.be.true;
      }

      const skippedTests = result.summary!.results.filter((r: TestResult) => r.status === 'skipped');
      const expectedSkippedCount = 3;

      expect(skippedTests.length).to.equal(expectedSkippedCount, `Expected ${expectedSkippedCount} skipped tests, but got ${skippedTests.length}`);
    },

    'Test Execution Output': {
      setup: async (): Promise<TestContext> => {
        const exampleTestPath = path.resolve(__dirname, '../examples/example.test.ts');
        
        if (!fs.existsSync(exampleTestPath)) {
          throw new Error(`Test file not found: ${exampleTestPath}`);
        }

        const result = await runTestFile(exampleTestPath);
        return { output: result.output };
      },

      'should start test execution': async (ctx?: TestContext): Promise<void> => {
        expect(ctx?.output).to.include('Running test suite:', 'Test execution did not start properly');
      },

      'should complete test execution': async (ctx?: TestContext): Promise<void> => {
        const cleanOutput = stripAnsi(ctx?.output ?? '');
        expect(cleanOutput).to.match(/finished with \d+ error\(s\)/, 'Test execution did not complete properly');
      },

      'should include Basic Tests suite': async (ctx?: TestContext): Promise<void> => {
        expect(ctx?.output).to.include('Basic Tests', 'Expected to find "Basic Tests" suite in output');
      },

      'should include Error Handling suite': async (ctx?: TestContext): Promise<void> => {
        expect(ctx?.output).to.include('Error Handling', 'Expected to find "Error Handling" suite in output');
      },

      'should include Nested Suites suite': async (ctx?: TestContext): Promise<void> => {
        expect(ctx?.output).to.include('Nested Suites', 'Expected to find "Nested Suites" suite in output');
      }
    }
  }
});

