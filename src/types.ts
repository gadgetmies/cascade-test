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
 * Skip function that determines if tests should be skipped
 */
export type SkipFunction = () => boolean | string | null | undefined;

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
 * Test result for a single test
 */
export interface TestResult {
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
export type TestFunctionType = (suite: TestSuite) => Promise<void>;

/**
 * Module exports interface
 */
export interface CascadeTestModule {
  test: TestFunctionType;
  fileUtils: FileUtils;
}