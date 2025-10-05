import * as R from 'ramda';
import * as fs from 'fs';
import * as path from 'path';
import 'colors';
import { createReporter, detectCI, addCIAnnotations } from './reporters.js';
const DefaultAssertionTimeout = 5000;
const DefaultGroupTimeout = 10000;
const noop = () => null;
const timeout = (timeoutMs) => {
    let id;
    const promise = new Promise((_, reject) => {
        id = setTimeout(() => {
            reject(`Test timed out after ${timeoutMs}ms`);
        }, timeoutMs);
    });
    return {
        promise,
        cancel: () => clearTimeout(id),
    };
};
function getCallerFile() {
    const originalFunc = Error.prepareStackTrace;
    let callerfile;
    try {
        const err = new Error();
        let currentfile;
        Error.prepareStackTrace = function (err, stack) {
            return stack;
        };
        // When prepareStackTrace is set, err.stack becomes NodeJS.CallSite[] instead of string
        const stack = err.stack;
        currentfile = stack?.shift()?.getFileName() || undefined;
        while (stack && stack.length) {
            callerfile = stack.shift()?.getFileName() || undefined;
            if (currentfile !== callerfile)
                break;
        }
    }
    catch (e) {
        // Ignore errors
    }
    Error.prepareStackTrace = originalFunc;
    return callerfile;
}
const test = async (suite, config = {}) => {
    // Read configuration from environment variables if not provided
    const finalConfig = {
        reporter: config.reporter || process.env.CASCADE_TEST_REPORTER || 'console',
        outputFile: config.outputFile || process.env.CASCADE_TEST_OUTPUT || undefined,
        ci: config.ci || process.env.CASCADE_TEST_CI || undefined
    };
    // Initialize reporter and CI detection
    const ci = finalConfig.ci || detectCI();
    const reporter = createReporter(finalConfig.reporter || 'console', finalConfig.outputFile);
    const testResults = [];
    const extractFnPaths = (node) => Object.keys(node).reduce((acc, key) => {
        const value = node[key];
        if (R.is(Function, value)) {
            return [...acc, [key, value]];
        }
        else if (typeof value === 'object' && value !== null) {
            const nestedPaths = extractFnPaths(value);
            return [...acc, ...nestedPaths.map(path => [key, path])];
        }
        return acc;
    }, []);
    const collectDescriptions = (node) => Object.keys(node).reduce((acc, key) => {
        const value = node[key];
        if (R.allPass([R.is(Object), R.complement(R.is(Function))])(value)) {
            return [...acc, [key, collectDescriptions(value)]];
        }
        else {
            return [...acc, [key]];
        }
    }, []);
    const printFail = (error, style = 'console') => style === 'console' ? `${'FAIL'.red}: ${error}` : `<span class="fail">FAIL: ${error}</span>`;
    const printPass = (style = 'console') => style === 'console' ? 'PASS'.green : '<span class="pass">PASS</span>';
    const printSkip = (style = 'console') => style === 'console' ? 'SKIP'.yellow : '<span class="pass">SKIP</span>';
    const printName = (name, style = 'console') => style === 'console' ? `• ${name.cyan}:\n` : `<span class="test">${name}:</span>\n`;
    const printChildren = (children, style = 'console') => style === 'console' ? children.join('\n') : `<ul>\n${children.map((c) => `<li>${c}</li>\n`).join('')}\n</ul>\n`;
    const getIndentString = (indent) => Array(indent).join(' ');
    const isTestGroup = (content) => {
        return Array.isArray(content);
    };
    const isTestResult = (content) => {
        return !Array.isArray(content) && 'error' in content;
    };
    const isTestStructure = (description) => {
        return description.length === 2;
    };
    const collectFailedTests = (structure, currentPath = []) => {
        const [name, content] = structure;
        const fullPath = [...currentPath, name];
        const failedTests = [];
        if (isTestGroup(content)) {
            for (const child of content) {
                if (isTestStructure(child)) {
                    failedTests.push(...collectFailedTests(child, fullPath));
                }
                // TODO: In what case would the content be a list of strings and contain only one element?
                // Skip [string] only descriptions as they don't contain test results
            }
        }
        else if (isTestResult(content) && content.error) {
            // This is a failed test
            failedTests.push({
                path: fullPath,
                error: content.error
            });
        }
        return failedTests;
    };
    const printStructure = (node, style = 'console', indent = 2) => {
        const indentString = getIndentString(indent);
        return `\
${printName(node[0], style)}${R.is(Array, node[1])
            ? printChildren(node[1].map((n) => indentString.concat(printStructure(n, style, indent + 2))), style)
            : node[1].error !== null
                ? indentString.concat(printFail(node[1].error, style))
                : node[1].skipped
                    ? indentString.concat(printSkip(style))
                    : indentString.concat(printPass(style))}`;
    };
    const run = async (suite, { skippingReason, indent = 0, parentContext, currentPath = [] } = {}) => {
        try {
            const { setup = noop, teardown = noop, skip = noop, ...rest } = suite;
            if (skip !== noop) {
                const skipResult = skip();
                if (skipResult && typeof skipResult === 'object' && 'reason' in skipResult && 'until' in skipResult) {
                    const skipConfig = skipResult;
                    const skipDate = new Date(skipConfig.until);
                    const now = new Date();
                    if (skipDate > now) {
                        skippingReason = skipConfig.reason;
                    }
                    else {
                        return [[
                                'skip-expired',
                                {
                                    skipped: false,
                                    error: `Test skip expired on ${skipDate.toISOString()}. Reason: ${skipConfig.reason}`,
                                }
                            ]];
                    }
                }
            }
            let setupResult;
            if (skippingReason === undefined) {
                try {
                    setupResult = await setup(parentContext);
                }
                catch (e) {
                    console.error(e);
                    return [[
                            'setup-error',
                            {
                                skipped: false,
                                error: `Setup failed with: '${e.toString()}'`,
                            }
                        ]];
                }
            }
            // If no setup was provided, inherit from parent context
            if (setup === noop && parentContext) {
                setupResult = parentContext;
            }
            const result = [];
            for (const key of Object.keys(rest)) {
                console.log(`${getIndentString(indent)}• ${key} ${skippingReason ? `SKIPPING (reason: ${skippingReason})` : ''}`.blue);
                const restElement = rest[key];
                let singleResult;
                const timeouts = [];
                try {
                    if (R.is(Function, restElement)) {
                        const testStartTime = Date.now();
                        const testPath = [...currentPath, key];
                        if (skippingReason) {
                            singleResult = {
                                skipped: skippingReason,
                                error: null,
                            };
                            // Record skipped test
                            testResults.push({
                                name: key,
                                path: testPath,
                                passed: true, // Skipped tests are considered passed
                                duration: Date.now() - testStartTime
                            });
                        }
                        else {
                            const assertionTimeout = timeout(setupResult?.timeout || DefaultAssertionTimeout);
                            timeouts.push(assertionTimeout);
                            const { cancel, promise: timeoutPromise } = assertionTimeout;
                            const res = await Promise.race([restElement(setupResult), timeoutPromise]);
                            const testDuration = Date.now() - testStartTime;
                            const testError = R.defaultTo(null, res);
                            singleResult = {
                                skipped: false,
                                error: testError,
                            };
                            // Record test result
                            testResults.push({
                                name: key,
                                path: testPath,
                                passed: !testError,
                                error: testError ? testError : undefined,
                                duration: testDuration
                            });
                            cancel();
                        }
                    }
                    else {
                        const groupTimeout = timeout(setupResult?.timeout || DefaultGroupTimeout);
                        timeouts.push(groupTimeout);
                        const { cancel, promise: timeoutPromise } = groupTimeout;
                        const nestedResults = await run(restElement, {
                            skippingReason,
                            indent: indent + 2,
                            parentContext: setupResult,
                            currentPath: [...currentPath, key]
                        });
                        singleResult = nestedResults;
                        cancel();
                    }
                }
                catch (e) {
                    console.error(`Test '${key}' failed:`.red, e);
                    singleResult = { skipped: false, error: e.toString() };
                    timeouts.forEach((t) => t.cancel());
                }
                result.push([key, singleResult]);
            }
            if (!skippingReason) {
                try {
                    await teardown(setupResult);
                }
                catch (e) {
                    console.error(e);
                    throw new Error(`Teardown failed with: '${e.toString()}'`);
                }
            }
            return result;
        }
        catch (e) {
            console.error(e);
            throw new Error(`Test group execution failed!: '${e.toString()}'`);
        }
    };
    try {
        const testFile = getCallerFile();
        console.log('Running test suite: \n'.cyan, testFile?.cyan || '');
        const result = [testFile, await run(suite, { currentPath: [testFile || 'unknown'] })];
        console.log(printStructure(result));
        const failedTests = collectFailedTests(result);
        const exitCode = failedTests.length === 0 ? 0 : 1;
        // Use reporter to generate output
        reporter.onTestSuiteComplete(testResults, testFile || 'unknown');
        const reporterOutput = reporter.generateOutput();
        console.log(`\nTest suite finished ${exitCode === 0 ? 'successfully' : `with ${failedTests.length} errors`}`);
        // Add CI-specific annotations
        addCIAnnotations(failedTests, ci);
        if (failedTests.length > 0) {
            console.log('\n' + '='.repeat(60).red);
            console.log(`FAILED TESTS: ${testFile}`.red.bold);
            console.log('='.repeat(60).red);
            failedTests.forEach((failedTest) => {
                const pathString = failedTest.path.slice(1).join(' → ');
                console.log(`\n• ${pathString}`.red);
                console.log(`  Error: ${failedTest.error}`.yellow);
            });
            console.log('\n' + '='.repeat(60).red);
            // Write failed test information to a temporary file for CLI consumption
            const tempFile = path.join(process.cwd(), '.cascade-test-failures.json');
            try {
                fs.writeFileSync(tempFile, JSON.stringify(failedTests, null, 2));
            }
            catch (e) {
                // Ignore file write errors
            }
        }
        // Don't exit immediately - let the process exit naturally
        // This allows the parent process to capture the output
        setTimeout(() => process.exit(exitCode), 0);
    }
    catch (e) {
        console.error(`Test suite execution failed: ${e.toString()}`.red);
        console.error(e);
    }
};
export default test;
//# sourceMappingURL=test.js.map