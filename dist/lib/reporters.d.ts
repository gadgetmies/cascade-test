import { TestReporter, TestInfo, TestResult, CIEnvironment } from '../types';
/**
 * Detect CI environment from environment variables
 */
export declare const detectCI: () => CIEnvironment;
/**
 * Add CI-specific annotations to console output
 */
export declare const addCIAnnotations: (failedTests: Array<{
    path: string[];
    error: string;
}>, ci: CIEnvironment) => void;
/**
 * Console reporter - maintains existing behavior
 */
export declare class ConsoleReporter implements TestReporter {
    private results;
    onTestStart(test: TestInfo): void;
    onTestResult(result: TestResult): void;
    onTestSuiteComplete(results: TestResult[], testFile: string): void;
    generateOutput(): string;
}
/**
 * JUnit XML reporter
 */
export declare class JUnitReporter implements TestReporter {
    private results;
    private testFile;
    onTestStart(test: TestInfo): void;
    onTestResult(result: TestResult): void;
    onTestSuiteComplete(results: TestResult[], testFile: string): void;
    generateOutput(): string;
    private escapeXml;
}
/**
 * TAP (Test Anything Protocol) reporter
 */
export declare class TAPReporter implements TestReporter {
    private results;
    onTestStart(test: TestInfo): void;
    onTestResult(result: TestResult): void;
    onTestSuiteComplete(results: TestResult[], testFile: string): void;
    generateOutput(): string;
}
/**
 * JSON reporter
 */
export declare class JSONReporter implements TestReporter {
    private results;
    private testFile;
    onTestStart(test: TestInfo): void;
    onTestResult(result: TestResult): void;
    onTestSuiteComplete(results: TestResult[], testFile: string): void;
    generateOutput(): string;
}
/**
 * Create a reporter instance
 */
export declare const createReporter: (type: string, outputFile?: string) => TestReporter;
//# sourceMappingURL=reporters.d.ts.map