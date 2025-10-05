"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCIAnnotations = exports.detectCI = exports.createReporter = exports.fileUtils = exports.test = void 0;
const test_1 = __importDefault(require("./lib/test"));
exports.test = test_1.default;
const file_utils_1 = __importDefault(require("./lib/file-utils"));
exports.fileUtils = file_utils_1.default;
const reporters_1 = require("./lib/reporters");
Object.defineProperty(exports, "createReporter", { enumerable: true, get: function () { return reporters_1.createReporter; } });
Object.defineProperty(exports, "detectCI", { enumerable: true, get: function () { return reporters_1.detectCI; } });
Object.defineProperty(exports, "addCIAnnotations", { enumerable: true, get: function () { return reporters_1.addCIAnnotations; } });
const cascadeTest = {
    test: test_1.default,
    fileUtils: file_utils_1.default,
    createReporter: reporters_1.createReporter,
    detectCI: reporters_1.detectCI,
    addCIAnnotations: reporters_1.addCIAnnotations
};
exports.default = cascadeTest;
//# sourceMappingURL=index.js.map