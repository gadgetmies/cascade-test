export interface TestContext {
  [key: string]: any;
  timeout?: number;
}
export type TestRunResult = string | null | undefined;
export type TestRunResultPromise = Promise<TestRunResult>
export type TestFunction = (context?: TestContext) => TestRunResult | TestRunResultPromise;

export type SetupFunction = (parentContext?: TestContext) => Promise<TestContext> | TestContext;

export type TeardownFunction = (context?: TestContext) => Promise<void> | void;

export interface SkipConfig {
  reason: string;
  until: Date | string;
}

export type SkipFunction = () => SkipConfig | null | undefined;

export interface TestSuite {
  setup?: SetupFunction;
  teardown?: TeardownFunction;
  skip?: SkipFunction;
  timeout?: number;
  [testName: string]: TestFunction | TestSuite | SetupFunction | TeardownFunction | SkipFunction | number | undefined;
}


export type CIEnvironment = 'jenkins' | 'azure' | 'gitlab' | 'github' | 'console';

export type TestReporterType = 'console' | 'junit' | 'tap' | 'json' | 'mocha-json';

export interface TestConfig {
  reporter?: TestReporterType;
  outputFile?: string;
  ci?: CIEnvironment;
}

export interface TestInfo {
  name: string;
  path: string[];
  startTime: number;
}

export type TestStatus = 'passed' | 'failed' | 'skipped';

export interface TestResult {
  name: string;
  path: string[];
  status: TestStatus;
  error?: string;
  duration: number;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  failedTests: Array<{ path: string[]; error: string }>;
  results: TestResult[];
}

export interface TestReporter {
  onTestStart(test: TestInfo): void;
  onTestResult(result: TestResult): void;
  onTestSuiteComplete(results: TestResult[], testFile: string): void;
  generateOutput(): string;
}

export interface InternalTestResult {
  skipped: boolean | string;
  error: string | null;
}

export interface TestOptions {
  skippingReason?: boolean | string;
  indent?: number;
  parentContext?: TestContext;
}

export interface TimeoutConfig {
  promise: Promise<never>;
  cancel: () => void;
}

export interface FileUtils {
  recursivelyFindByRegex: (base: string, regex: RegExp) => string[];
}

export type TestFunctionType = (suite: TestSuite, config?: TestConfig) => Promise<void>;

export interface CascadeTestModule {
  test: TestFunctionType;
  fileUtils: FileUtils;
  createReporter: (type: string, outputFile?: string) => TestReporter;
  detectCI: () => CIEnvironment;
  addCIAnnotations: (failedTests: Array<{ path: string[]; error: string }>, ci: CIEnvironment) => void;
}

// Fixture utility types
export interface FixtureConfig {
  /** Base directory for fixtures (defaults to 'fixtures' relative to test file) */
  fixturesDir?: string;
  /** Whether to update fixtures when they don't match (defaults to false) */
  updateFixtures?: boolean;
  /** Custom serializer for data (defaults to JSON.stringify with 2-space indentation) */
  serializer?: (data: any) => string;
  /** Custom deserializer for data (defaults to JSON.parse) */
  deserializer?: (data: string) => any;
  /** Whether to normalize data before comparison (e.g., sort arrays, remove timestamps) */
  normalize?: (data: any) => any;
}