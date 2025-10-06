import { test } from '../../index.js';
import { TestContext, TestResult, TestSummary } from '../../types.js';
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
  reporterOutput?: string;
}

const runTestFile = (testFilePath: string, reporter?: string, outputFile?: string): Promise<TestRunResult> => {
  return new Promise((resolve, reject) => {
    const child: ChildProcess = fork(testFilePath, [], {
      env: {
        ...process.env,
        CASCADE_TEST_REPORTER: reporter || 'console',
        CASCADE_TEST_OUTPUT: outputFile || '',
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
      let reporterOutput;
      
      try {
        if (fs.existsSync(tempFile)) {
          summary = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
          fs.unlinkSync(tempFile);
        }
      } catch (e) {
        // Ignore errors
      }

      if (outputFile) {
        try {
          if (fs.existsSync(outputFile)) {
            reporterOutput = fs.readFileSync(outputFile, 'utf8');
            fs.unlinkSync(outputFile);
          }
        } catch (e) {
          // Ignore errors
        }
      }

      resolve({
        code: code || 0,
        output,
        summary,
        reporterOutput
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
      const exampleTestPath = path.resolve(__dirname, '../examples/example.test.js');
      
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
        const found = failedTests.some((test: { path: string[]; error: string }) => 
          test.path.some((segment: string) => segment.includes(expectedFailure))
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
      const exampleTestPath = path.resolve(__dirname, '../examples/example.test.js');
      
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
      const exampleTestPath = path.resolve(__dirname, '../examples/example.test.js');
      
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
  },

  'Reporter Tests': {
    'should generate valid JUnit XML output': async (): Promise<string | null> => {
      const exampleTestPath = path.resolve(__dirname, '../examples/example.test.js');
      const outputFile = path.join(process.cwd(), 'test-junit-output.xml');
      
      const result = await runTestFile(exampleTestPath, 'junit', outputFile);
      
      if (!result.reporterOutput) {
        return 'JUnit reporter did not generate output';
      }
      
      if (!result.reporterOutput.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
        return 'JUnit output is not valid XML';
      }
      
      if (!result.reporterOutput.includes('<testsuite')) {
        return 'JUnit output missing testsuite element';
      }
      
      if (!result.reporterOutput.includes('tests="7"')) {
        return 'JUnit output incorrect test count';
      }
      
      if (!result.reporterOutput.includes('failures="1"')) {
        return 'JUnit output incorrect failure count';
      }
      
      return null;
    },

    'should generate valid TAP output': async (): Promise<string | null> => {
      const exampleTestPath = path.resolve(__dirname, '../examples/example.test.js');
      const outputFile = path.join(process.cwd(), 'test-tap-output.tap');
      
      const result = await runTestFile(exampleTestPath, 'tap', outputFile);
      
      if (!result.reporterOutput) {
        return 'TAP reporter did not generate output';
      }
      
      if (!result.reporterOutput.includes('TAP version 13')) {
        return 'TAP output missing version header';
      }
      
      if (!result.reporterOutput.includes('1..7')) {
        return 'TAP output incorrect test plan';
      }
      
      if (!result.reporterOutput.match(/ok \d+/)) {
        return 'TAP output missing ok directives';
      }
      
      if (!result.reporterOutput.match(/not ok \d+/)) {
        return 'TAP output missing not ok directives';
      }
      
      return null;
    },

    'should generate valid JSON output': async (): Promise<string | null> => {
      const exampleTestPath = path.resolve(__dirname, '../examples/example.test.js');
      const outputFile = path.join(process.cwd(), 'test-json-output.json');
      
      const result = await runTestFile(exampleTestPath, 'json', outputFile);
      
      if (!result.reporterOutput) {
        return 'JSON reporter did not generate output';
      }
      
      let jsonData;
      try {
        jsonData = JSON.parse(result.reporterOutput);
      } catch (e) {
        return 'JSON output is not valid JSON';
      }
      
      if (!jsonData.summary) {
        return 'JSON output missing summary';
      }
      
      if (jsonData.summary.total !== 7) {
        return `JSON output incorrect total count: ${jsonData.summary.total}`;
      }
      
      if (jsonData.summary.passed !== 4) {
        return `JSON output incorrect passed count: ${jsonData.summary.passed}`;
      }
      
      if (jsonData.summary.failed !== 1) {
        return `JSON output incorrect failed count: ${jsonData.summary.failed}`;
      }
      
      if (!Array.isArray(jsonData.results)) {
        return 'JSON output missing results array';
      }
      
      return null;
    },

    'should generate valid Mocha JSON output': async (): Promise<string | null> => {
      const exampleTestPath = path.resolve(__dirname, '../examples/example.test.js');
      const outputFile = path.join(process.cwd(), 'test-mocha-json-output.json');
      
      const result = await runTestFile(exampleTestPath, 'mocha-json', outputFile);
      
      if (!result.reporterOutput) {
        return 'Mocha JSON reporter did not generate output';
      }
      
      let jsonData;
      try {
        jsonData = JSON.parse(result.reporterOutput);
      } catch (e) {
        return 'Mocha JSON output is not valid JSON';
      }
      
      if (!jsonData.stats) {
        return 'Mocha JSON output missing stats';
      }
      
      if (jsonData.stats.tests !== 7) {
        return `Mocha JSON output incorrect test count: ${jsonData.stats.tests}`;
      }
      
      if (jsonData.stats.passes !== 4) {
        return `Mocha JSON output incorrect passes count: ${jsonData.stats.passes}`;
      }
      
      if (jsonData.stats.failures !== 1) {
        return `Mocha JSON output incorrect failures count: ${jsonData.stats.failures}`;
      }
      
      if (jsonData.stats.pending !== 2) {
        return `Mocha JSON output incorrect pending count: ${jsonData.stats.pending}`;
      }
      
      if (!Array.isArray(jsonData.tests)) {
        return 'Mocha JSON output missing tests array';
      }
      
      if (!Array.isArray(jsonData.passes)) {
        return 'Mocha JSON output missing passes array';
      }
      
      if (!Array.isArray(jsonData.failures)) {
        return 'Mocha JSON output missing failures array';
      }
      
      if (!Array.isArray(jsonData.pending)) {
        return 'Mocha JSON output missing pending array';
      }
      
      return null;
    }
  }
});

