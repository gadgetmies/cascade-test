import test from './lib/test';
import fileUtils from './lib/file-utils';
import { createReporter, detectCI, addCIAnnotations } from './lib/reporters';
import { CascadeTestModule } from './types';

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
} from './types';

export default cascadeTest;