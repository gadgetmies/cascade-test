import { test } from '../index.js';
import { TestContext, TestResult, TestSummary } from '../types.js';
import { fork, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestRunResult {
  code: number;
  output: string;
  summary?: TestSummary;
}

const runTestFile = (testFilePath: string): Promise<TestRunResult> => {
  return new Promise((resolve, reject) => {
    const child: ChildProcess = fork(testFilePath, [], {
      env: {
        ...process.env,
        CASCADE_TEST_REPORTER: 'console',
        CASCADE_TEST_CI: 'console'
      },
      silent: true
    });

    let output = '';

    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.stderr?.on('data', (data) => {
      output += data.toString();
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      const tempFile = path.join(process.cwd(), '.cascade-test-results.json');
      let summary;
      
      try {
        if (fs.existsSync(tempFile)) {
          summary = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
          fs.unlinkSync(tempFile);
        }
      } catch (e) {
        // Ignore errors
      }

      resolve({
        code: code || 0,
        output,
        summary
      });
    });
  });
};

test({
  setup: async (): Promise<TestContext> => {
    console.log('Setting up framework tests...');
    return { timeout: 30000 };
  },

  teardown: async (): Promise<void> => {
    console.log('Cleaning up framework tests...');
  },

  'Framework Tests': {
    'should run example.test.ts and get expected results': async (): Promise<string | null> => {
      const exampleTestPath = path.resolve(__dirname, 'example.test.js');
      
      if (!fs.existsSync(exampleTestPath)) {
        return `Test file not found: ${exampleTestPath}`;
      }

      const result = await runTestFile(exampleTestPath);

      if (!result.summary) {
        return 'Failed to get test summary from example.test.ts';
      }

      const expectedTotalTests = 7;
      const expectedPassedTests = 4;
      const expectedFailedTests = 1;
      const expectedSkippedTests = 2;

      const actualTotal = result.summary.total;
      const actualPassed = result.summary.passed;
      const actualFailed = result.summary.failed;
      const actualSkipped = result.summary.skipped;

      if (actualTotal !== expectedTotalTests) {
        return `Expected ${expectedTotalTests} total tests, but got ${actualTotal}`;
      }

      if (actualPassed !== expectedPassedTests) {
        return `Expected ${expectedPassedTests} passed tests, but got ${actualPassed}`;
      }

      if (actualFailed !== expectedFailedTests) {
        return `Expected ${expectedFailedTests} failed tests, but got ${actualFailed}`;
      }

      if (actualSkipped !== expectedSkippedTests) {
        return `Expected ${expectedSkippedTests} skipped tests, but got ${actualSkipped}`;
      }

      const failedTests = result.summary.failedTests;
      const expectedFailuresInResults = ['should fail with custom error'];
      const expectedFailuresInFailedTests = [
        'Error Handling',
        'Expired Skip'
      ];

      for (const expectedFailure of expectedFailuresInFailedTests) {
        const found = failedTests.some(test => 
          test.path.some(segment => segment.includes(expectedFailure))
        );
        
        if (!found) {
          return `Expected to find failed test path containing: "${expectedFailure}"`;
        }
      }
      
      if (failedTests.length !== 2) {
        return `Expected 2 items in failedTests array, but got ${failedTests.length}`;
      }

      if (result.code !== 1) {
        return `Expected exit code 1 (because tests have intentional failures), but got ${result.code}`;
      }

      return null;
    },

    'should validate specific test outputs': async (): Promise<string | null> => {
      const exampleTestPath = path.resolve(__dirname, 'example.test.js');
      
      if (!fs.existsSync(exampleTestPath)) {
        return `Test file not found: ${exampleTestPath}`;
      }

      const result = await runTestFile(exampleTestPath);

      if (!result.summary) {
        return 'Failed to get test summary';
      }

      const passedTests = result.summary.results.filter((r: TestResult) => r.status === 'passed');

      const expectedPassedTests = [
        'should pass simple assertion',
        'should handle async operations',
        'should pass when no error returned',
        'should access nested context'
      ];

      for (const expectedTest of expectedPassedTests) {
        const found = passedTests.some((test: TestResult) => test.name === expectedTest);
        if (!found) {
          return `Expected to find passed test: "${expectedTest}"`;
        }
      }

      const skippedTests = result.summary.results.filter((r: TestResult) => r.status === 'skipped');
      const expectedSkippedCount = 2;

      if (skippedTests.length !== expectedSkippedCount) {
        return `Expected ${expectedSkippedCount} skipped tests, but got ${skippedTests.length}`;
      }

      return null;
    },

    'should verify test execution completes': async (): Promise<string | null> => {
      const exampleTestPath = path.resolve(__dirname, 'example.test.js');
      
      if (!fs.existsSync(exampleTestPath)) {
        return `Test file not found: ${exampleTestPath}`;
      }

      const result = await runTestFile(exampleTestPath);

      if (!result.output.includes('Running test suite:')) {
        return 'Test execution did not start properly';
      }

      if (!result.output.includes('Test suite finished')) {
        return 'Test execution did not complete properly';
      }

      if (!result.output.includes('Basic Tests')) {
        return 'Expected to find "Basic Tests" suite in output';
      }

      if (!result.output.includes('Error Handling')) {
        return 'Expected to find "Error Handling" suite in output';
      }

      if (!result.output.includes('Nested Suites')) {
        return 'Expected to find "Nested Suites" suite in output';
      }

      return null;
    }
  }
});

