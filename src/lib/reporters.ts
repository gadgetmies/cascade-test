import * as fs from 'fs';
import * as path from 'path';
import { TestReporter, TestInfo, TestResult, CIEnvironment } from '../types.js';

/**
 * Detect CI environment from environment variables
 */
export const detectCI = (): CIEnvironment => {
  if (process.env.JENKINS_URL) return 'jenkins';
  if (process.env.AZURE_DEVOPS || process.env.TF_BUILD) return 'azure';
  if (process.env.GITLAB_CI) return 'gitlab';
  if (process.env.GITHUB_ACTIONS) return 'github';
  return 'console';
};

/**
 * Add CI-specific annotations to console output
 */
export const addCIAnnotations = (failedTests: Array<{ path: string[]; error: string }>, ci: CIEnvironment): void => {
  if (failedTests.length === 0) return;

  switch (ci) {
    case 'jenkins':
      console.log('##[error]Test failures detected');
      failedTests.forEach(test => {
        console.log(`##[error]${test.path.join(' → ')}: ${test.error}`);
      });
      break;
    case 'azure':
      console.log('##vso[task.logissue type=error]Test failures detected');
      failedTests.forEach(test => {
        console.log(`##vso[task.logissue type=error]${test.path.join(' → ')}: ${test.error}`);
      });
      break;
    case 'gitlab':
      console.log('::error::Test failures detected');
      failedTests.forEach(test => {
        console.log(`::error::${test.path.join(' → ')}: ${test.error}`);
      });
      break;
    case 'github':
      console.log('::error::Test failures detected');
      failedTests.forEach(test => {
        console.log(`::error::${test.path.join(' → ')}: ${test.error}`);
      });
      break;
    case 'console':
    default:
      // No special annotations for console
      break;
  }
};

/**
 * Console reporter - maintains existing behavior
 */
export class ConsoleReporter implements TestReporter {
  private results: TestResult[] = [];

  onTestStart(test: TestInfo): void {
    // Console reporter doesn't need to track individual test starts
  }

  onTestResult(result: TestResult): void {
    this.results.push(result);
  }

  onTestSuiteComplete(results: TestResult[], testFile: string): void {
    this.results = results;
    // Console output is handled by the main test runner
  }

  generateOutput(): string {
    return ''; // Console output is handled elsewhere
  }
}

/**
 * JUnit XML reporter
 */
export class JUnitReporter implements TestReporter {
  private results: TestResult[] = [];
  private testFile: string = '';

  onTestStart(test: TestInfo): void {
    // JUnit doesn't need individual test starts
  }

  onTestResult(result: TestResult): void {
    this.results.push(result);
  }

  onTestSuiteComplete(results: TestResult[], testFile: string): void {
    this.results = results;
    this.testFile = testFile;
  }

  generateOutput(): string {
    const totalTests = this.results.length;
    const failures = this.results.filter(r => !r.passed).length;
    const errors = 0; // We don't distinguish between failures and errors
    const time = this.results.reduce((sum, r) => sum + r.duration, 0) / 1000;

    const testCases = this.results.map(result => {
      const testName = result.path.slice(1).join('.');
      const className = path.basename(this.testFile, path.extname(this.testFile));
      
      if (result.passed) {
        return `    <testcase name="${testName}" classname="${className}" time="${result.duration / 1000}"/>`;
      } else {
        return `    <testcase name="${testName}" classname="${className}" time="${result.duration / 1000}">
      <failure message="${this.escapeXml(result.error || 'Test failed')}"/>
    </testcase>`;
      }
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="${path.basename(this.testFile)}" tests="${totalTests}" failures="${failures}" errors="${errors}" time="${time}">
${testCases}
</testsuite>`;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

/**
 * TAP (Test Anything Protocol) reporter
 */
export class TAPReporter implements TestReporter {
  private results: TestResult[] = [];

  onTestStart(test: TestInfo): void {
    // TAP doesn't need individual test starts
  }

  onTestResult(result: TestResult): void {
    this.results.push(result);
  }

  onTestSuiteComplete(results: TestResult[], testFile: string): void {
    this.results = results;
  }

  generateOutput(): string {
    const totalTests = this.results.length;
    const testLines = this.results.map((result, index) => {
      const testName = result.path.slice(1).join(' ');
      if (result.passed) {
        return `ok ${index + 1} - ${testName}`;
      } else {
        return `not ok ${index + 1} - ${testName}
  ---
  message: ${result.error || 'Test failed'}
  ---`;
      }
    }).join('\n');

    return `TAP version 13
1..${totalTests}
${testLines}`;
  }
}

/**
 * JSON reporter
 */
export class JSONReporter implements TestReporter {
  private results: TestResult[] = [];
  private testFile: string = '';

  onTestStart(test: TestInfo): void {
    // JSON doesn't need individual test starts
  }

  onTestResult(result: TestResult): void {
    this.results.push(result);
  }

  onTestSuiteComplete(results: TestResult[], testFile: string): void {
    this.results = results;
    this.testFile = testFile;
  }

  generateOutput(): string {
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return JSON.stringify({
      testFile: this.testFile,
      summary: {
        total: totalTests,
        passed,
        failed,
        duration
      },
      results: this.results.map(result => ({
        name: result.path.slice(1).join(' '),
        path: result.path,
        passed: result.passed,
        error: result.error,
        duration: result.duration
      }))
    }, null, 2);
  }
}

/**
 * Mocha-compatible JSON reporter (mocha-json schema)
 */
export class MochaJsonReporter implements TestReporter {
  private results: TestResult[] = [];
  private testFile: string = '';

  onTestStart(test: TestInfo): void {}

  onTestResult(result: TestResult): void {
    this.results.push(result);
  }

  onTestSuiteComplete(results: TestResult[], testFile: string): void {
    this.results = results;
    this.testFile = testFile;
  }

  generateOutput(): string {
    // Build a minimal mocha-json compatible structure
    // See https://github.com/dorny/test-reporter#supported-reporters
    const tests = this.results.map(r => ({
      title: r.path.slice(-1)[0],
      fullTitle: r.path.slice(1).join(' '),
      file: this.testFile,
      duration: r.duration,
      currentRetry: 0,
      err: r.passed || r.skipped ? {} : { message: r.error || 'Test failed' }
    }));

    const passes = tests.filter((_, i) => this.results[i].passed && !this.results[i].skipped);
    const failures = tests.filter((_, i) => !this.results[i].passed);
    const pending = tests.filter((_, i) => !!this.results[i].skipped);

    const stats = {
      suites: 1,
      tests: this.results.length,
      passes: passes.length,
      pending: pending.length,
      failures: failures.length,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      duration: this.results.reduce((s, r) => s + r.duration, 0)
    };

    const payload = {
      stats,
      tests,
      pending,
      failures,
      passes
    };

    return JSON.stringify(payload, null, 2);
  }
}

/**
 * Create a reporter instance
 */
export const createReporter = (type: string, outputFile?: string): TestReporter => {
  let reporter: TestReporter;
  
  switch (type) {
    case 'junit':
      reporter = new JUnitReporter();
      break;
    case 'tap':
      reporter = new TAPReporter();
      break;
    case 'json':
      reporter = new JSONReporter();
      break;
    case 'mocha-json':
      reporter = new MochaJsonReporter();
      break;
    case 'console':
    default:
      reporter = new ConsoleReporter();
      break;
  }

  // If output file is specified, write the output to file
  if (outputFile && type !== 'console') {
    const originalGenerateOutput = reporter.generateOutput.bind(reporter);
    reporter.generateOutput = () => {
      const output = originalGenerateOutput();
      try {
        fs.writeFileSync(outputFile, output);
        console.log(`Test results written to: ${outputFile}`);
      } catch (e) {
        console.error(`Failed to write test results to ${outputFile}:`, e);
      }
      return output;
    };
  }

  return reporter;
};
