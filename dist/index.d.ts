import test from './lib/test';
import fileUtils from './lib/file-utils';
import { createReporter, detectCI, addCIAnnotations } from './lib/reporters';
import { CascadeTestModule } from './types';
declare const cascadeTest: CascadeTestModule;
export { test, fileUtils, createReporter, detectCI, addCIAnnotations };
export type { TestSuite, TestContext, TestOptions, TimeoutConfig, TestFunctionType, TestFunction, SetupFunction, TeardownFunction, SkipFunction, TestConfig, TestReporter, TestInfo, TestResult, CIEnvironment, TestReporterType } from './types';
export default cascadeTest;
//# sourceMappingURL=index.d.ts.map