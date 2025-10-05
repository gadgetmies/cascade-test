import test from './lib/test.js';
import fileUtils from './lib/file-utils.js';
import { createReporter, detectCI, addCIAnnotations } from './lib/reporters.js';
import { CascadeTestModule } from './types.js';

const cascadeTest: CascadeTestModule = {
  test,
  fileUtils,
  createReporter,
  detectCI,
  addCIAnnotations
};

export { test, fileUtils, createReporter, detectCI, addCIAnnotations };

// Export types
export type {
  TestSuite,
  TestContext,
  TestOptions,
  TimeoutConfig,
  TestFunctionType,
  TestFunction,
  SetupFunction,
  TeardownFunction,
  SkipFunction,
  TestConfig,
  TestReporter,
  TestInfo,
  TestResult,
  CIEnvironment,
  TestReporterType
} from './types.js';

export default cascadeTest;