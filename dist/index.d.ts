import test from './lib/test.js';
import fileUtils from './lib/file-utils.js';
import { createReporter, detectCI, addCIAnnotations } from './lib/reporters.js';
import { CascadeTestModule } from './types.js';
declare const cascadeTest: CascadeTestModule;
export { test, fileUtils, createReporter, detectCI, addCIAnnotations };
export type { TestSuite, TestContext, TestOptions, TimeoutConfig, TestFunctionType, TestFunction, SetupFunction, TeardownFunction, SkipFunction, TestConfig, TestReporter, TestInfo, TestResult, CIEnvironment, TestReporterType } from './types.js';
export default cascadeTest;
//# sourceMappingURL=index.d.ts.map