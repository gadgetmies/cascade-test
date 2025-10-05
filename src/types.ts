/**
 * Test context that gets passed through the test hierarchy
 */
export interface TestContext {
  [key: string]: any;
  timeout?: number;
}

/**
 * Test function that receives context and returns an error message or null/undefined for pass
 */
export type TestFunction = (context?: TestContext) => Promise<string | null | undefined> | string | null | undefined;

/**
 * Setup function that runs before tests and returns context
 */
export type SetupFunction = (parentContext?: TestContext) => Promise<TestContext> | TestContext;

/**
 * Teardown function that runs after tests for cleanup
 */
export type TeardownFunction = (context?: TestContext) => Promise<void> | void;

/**
 * Skip configuration object
 */
export interface SkipConfig {
  reason: string;
  until: Date | string;
}

/**
 * Skip function that determines if tests should be skipped
 */
export type SkipFunction = () => SkipConfig | null | undefined;

/**
 * Test suite configuration
 */
export interface TestSuite {
  setup?: SetupFunction;
  teardown?: TeardownFunction;
  skip?: SkipFunction;
  timeout?: number;
  [testName: string]: TestFunction | TestSuite | SetupFunction | TeardownFunction | SkipFunction | number | undefined;
}

/**
 * CI environment types
 */
export type CIEnvironment = 'jenkins' | 'azure' | 'gitlab' | 'github' | 'console';

/**
 * Test reporter types
 */
export type TestReporterType = 'console' | 'junit' | 'tap' | 'json';

/**
 * Test configuration
 */
export interface TestConfig {
  reporter?: TestReporterType;
  outputFile?: string;
  ci?: CIEnvironment;
}

/**
 * Test information for reporters
 */
export interface TestInfo {
  name: string;
  path: string[];
  startTime: number;
}

/**
 * Test result for reporters
 */
export interface TestResult {
  name: string;
  path: string[];
  passed: boolean;
  error?: string;
  duration: number;
}

/**
 * Test reporter interface
 */
export interface TestReporter {
  onTestStart(test: TestInfo): void;
  onTestResult(result: TestResult): void;
  onTestSuiteComplete(results: TestResult[], testFile: string): void;
  generateOutput(): string;
}

/**
 * Internal test result for a single test (used by test runner)
 */
export interface InternalTestResult {
  skipped: boolean | string;
  error: string | null;
}

/**
 * Test execution options
 */
export interface TestOptions {
  skippingReason?: boolean | string;
  indent?: number;
  parentContext?: TestContext;
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  promise: Promise<never>;
  cancel: () => void;
}

/**
 * File utilities interface
 */
export interface FileUtils {
  recursivelyFindByRegex: (base: string, regex: RegExp) => string[];
}

/**
 * Main test function type
 */
export type TestFunctionType = (suite: TestSuite, config?: TestConfig) => Promise<void>;

/**
 * Module exports interface
 */
export interface CascadeTestModule {
  test: TestFunctionType;
  fileUtils: FileUtils;
  createReporter: (type: string, outputFile?: string) => TestReporter;
  detectCI: () => CIEnvironment;
  addCIAnnotations: (failedTests: Array<{ path: string[]; error: string }>, ci: CIEnvironment) => void;
}