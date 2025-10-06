export interface TestContext {
  [key: string]: any;
  timeout?: number;
}

export type TestFunction = (context?: TestContext) => Promise<string | null | undefined> | string | null | undefined;

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

export type TestReporterType = 'console' | 'junit' | 'tap' | 'json';

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

export interface TestResult {
  name: string;
  path: string[];
  passed: boolean;
  skipped?: boolean;
  error?: string;
  duration: number;
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