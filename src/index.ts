import test from './lib/test';
import fileUtils from './lib/file-utils';
import { CascadeTestModule } from './types';

const cascadeTest: CascadeTestModule = {
  test,
  fileUtils
};

export { test, fileUtils };
export default cascadeTest;