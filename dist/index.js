import test from './lib/test.js';
import fileUtils from './lib/file-utils.js';
import { createReporter, detectCI, addCIAnnotations } from './lib/reporters.js';
const cascadeTest = {
    test,
    fileUtils,
    createReporter,
    detectCI,
    addCIAnnotations
};
export { test, fileUtils, createReporter, detectCI, addCIAnnotations };
export default cascadeTest;
//# sourceMappingURL=index.js.map