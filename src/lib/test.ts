import * as R from 'ramda';
import * as fs from 'fs';
import * as path from 'path';
import 'colors';
import {
  TestSuite,
  TestContext,
  TestOptions,
  TimeoutConfig,
  TestFunctionType,
  TestFunction,
  SetupFunction,
  TeardownFunction,
  SkipFunction,
  SkipConfig,
  TestConfig,
  TestResult,
  InternalTestResult
} from '../types.js';
import { createReporter, detectCI, addCIAnnotations } from './reporters.js';
import { getDisplayTestFile } from './path-utils.js';

// Internal types for test execution
interface TestNode {
  [key: string]: TestFunction | TestSuite | SetupFunction | TeardownFunction | SkipFunction;
}

type TestPath = [string, TestFunction] | [string, TestPath[]];

type TestDescription = [string] | [string, TestDescription[]];

type TestContent = InternalTestResult | TestDescription[];
type TestStructure = [string, TestContent];

const DefaultAssertionTimeout = 5000;
const DefaultGroupTimeout = 10000;

const noop = (): null => null;
const passThrough = (value: any): any => value;

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeFilePath = (filePath: string): string => {
  if (filePath.startsWith('file://')) {
    return decodeURIComponent(filePath.replace('file://', ''));
  }
  return filePath;
};

const findTestImplementationLine = (filePath: string, testPath: string[]): number | undefined => {
  try {
    const source = fs.readFileSync(normalizeFilePath(filePath), 'utf8');
    const lines = source.split('\n');
    let searchFrom = 0;
    let matchedLine: number | undefined;

    for (const segment of testPath) {
      const escapedSegment = escapeRegExp(segment);
      const quotedPattern = new RegExp(`['"\`]${escapedSegment}['"\`]\\s*:`);
      const barePattern = new RegExp(`\\b${escapedSegment}\\b\\s*:`);
      let found = -1;

      for (let i = searchFrom; i < lines.length; i += 1) {
        const line = lines[i];
        if (quotedPattern.test(line) || barePattern.test(line)) {
          found = i;
          break;
        }
      }

      if (found === -1) {
        break;
      }

      matchedLine = found + 1;
      searchFrom = found + 1;
    }

    return matchedLine;
  } catch {
    return undefined;
  }
};

const timeout = (timeoutMs: number): TimeoutConfig => {
  let id: NodeJS.Timeout;
  const promise = new Promise<never>((_, reject) => {
    id = setTimeout(() => {
      reject(`Test timed out after ${timeoutMs}ms`);
    }, timeoutMs);
  });
  return {
    promise,
    cancel: () => clearTimeout(id),
  };
};

function getCallerFile(): string | undefined {
  const originalFunc = Error.prepareStackTrace;

  let callerfile: string | undefined;
  try {
    const err = new Error();
    let currentfile: string | undefined;

    Error.prepareStackTrace = function (err: Error, stack: NodeJS.CallSite[]) {
      return stack;
    };

    // When prepareStackTrace is set, err.stack becomes NodeJS.CallSite[] instead of string
    const stack = err.stack as unknown as NodeJS.CallSite[];
    currentfile = stack?.shift()?.getFileName() || undefined;

    while (stack && stack.length) {
      callerfile = stack.shift()?.getFileName() || undefined;

      if (currentfile !== callerfile) break;
    }
  } catch (e) {
    // Ignore errors
  }

  Error.prepareStackTrace = originalFunc;

  return callerfile;
}


const test: TestFunctionType = async (suite: TestSuite, config: TestConfig = {}): Promise<void> => {
  // Read configuration from environment variables if not provided
  const finalConfig: TestConfig = {
    reporter: config.reporter || process.env.CASCADE_TEST_REPORTER as any || 'console',
    outputFile: config.outputFile || process.env.CASCADE_TEST_OUTPUT || undefined,
    ci: config.ci || (process.env.CASCADE_TEST_CI as any) || undefined
  };
  
  // Initialize reporter and CI detection
  const ci = finalConfig.ci || detectCI();
  const reporter = createReporter(finalConfig.reporter || 'console', finalConfig.outputFile);
  const casePattern = config.testPattern || process.env.CASCADE_TEST_CASE_REGEX;
  const caseRegex = casePattern ? new RegExp(casePattern) : undefined;
  const testResults: TestResult[] = [];
  const matchesCaseFilter = (testPath: string[]): boolean => {
    if (!caseRegex) {
      return true;
    }
    caseRegex.lastIndex = 0;
    const scopePath = testPath.slice(1);
    const fullPath = scopePath.join(' > ');
    const leafName = scopePath.at(-1) || '';
    return caseRegex.test(fullPath) || caseRegex.test(leafName);
  };
  const suiteHasMatchingTests = (suiteNode: TestSuite, currentPath: string[]): boolean => {
    const { setup, teardown, skip, timeout, ...entries } = suiteNode;
    for (const key of Object.keys(entries)) {
      const value = entries[key];
      const nextPath = [...currentPath, key];
      if (R.is(Function, value)) {
        if (matchesCaseFilter(nextPath)) {
          return true;
        }
        continue;
      }
      if (suiteHasMatchingTests(value as TestSuite, nextPath)) {
        return true;
      }
    }
    return false;
  };
  const extractFnPaths = (node: TestNode): TestPath[] =>
    Object.keys(node).reduce(
      (acc: TestPath[], key: string) => {
        const value = node[key];
        if (R.is(Function, value)) {
          return [...acc, [key, value as TestFunction] as TestPath];
        } else if (typeof value === 'object') {
          const nestedPaths = extractFnPaths(value as TestNode);
          return [...acc, ...nestedPaths.map(path => [key, path] as unknown as TestPath)];
        }
        return acc;
      },
      [],
    );

  const collectDescriptions = (node: TestNode): TestDescription[] =>
    Object.keys(node).reduce(
      (acc: TestDescription[], key: string) => {
        const value = node[key];
        if (R.allPass([R.is(Object), R.complement(R.is(Function))])(value)) {
          return [...acc, [key, collectDescriptions(value as TestNode)] as TestDescription];
        } else {
          return [...acc, [key] as TestDescription];
        }
      },
      [],
    );

  const printFail = (error: string, style: string = 'console'): string =>
    style === 'console' ? `${'FAIL'.red}: ${error}` : `<span class="fail">FAIL: ${error}</span>`;

  const printPass = (style: string = 'console'): string => 
    style === 'console' ? 'PASS'.green : '<span class="pass">PASS</span>';

  const printSkip = (style: string = 'console'): string => 
    style === 'console' ? 'SKIP'.yellow : '<span class="pass">SKIP</span>';

  const printName = (name: string, style: string = 'console'): string =>
    style === 'console' ? `• ${name.cyan}:\n` : `<span class="test">${name}:</span>\n`;

  const printChildren = (children: string[], style: string = 'console'): string =>
    style === 'console' ? children.join('\n') : `<ul>\n${children.map((c) => `<li>${c}</li>\n`).join('')}\n</ul>\n`;

  const getIndentString = (indent: number): string => ' '.repeat(indent);

  interface FailedTest {
    path: string[];
    error: string;
    file?: string;
    line?: number;
  }

  const isTestGroup = (content: TestContent): content is TestDescription[] => {
    return Array.isArray(content);
  };

  const isTestResult = (content: TestContent): content is InternalTestResult => {
    return !Array.isArray(content) && 'error' in content;
  };

  const isTestStructure = (description: TestDescription): description is [string, TestDescription[]] => {
    return description.length === 2;
  };

  const collectFailedTests = (structure: TestStructure, currentPath: string[] = [], sourceFile?: string): FailedTest[] => {
    const [name, content] = structure;
    const fullPath = [...currentPath, name];
    const failedTests: FailedTest[] = [];

    if (isTestGroup(content)) {
      for (const child of content) {
        if (isTestStructure(child)) {
          failedTests.push(...collectFailedTests(child, fullPath, sourceFile));
        }
        // TODO: In what case would the content be a list of strings and contain only one element?
        // Skip [string] only descriptions as they don't contain test results
      }
    } else if (isTestResult(content) && content.error) {
      const testHierarchy = fullPath.slice(1);
      const resolvedSourceFile = sourceFile ? normalizeFilePath(sourceFile) : undefined;
      const line = resolvedSourceFile ? findTestImplementationLine(resolvedSourceFile, testHierarchy) : undefined;
      const relativeFile = resolvedSourceFile ? path.relative(process.cwd(), resolvedSourceFile) : undefined;
      // This is a failed test
      failedTests.push({
        path: fullPath,
        error: content.error,
        file: relativeFile,
        line
      });
    }

    return failedTests;
  };
  
  const printStructure = (node: TestStructure, style: string = 'console', indent: number = 2): string => {
    const indentString = getIndentString(indent);
    return `\
${printName(node[0], style)}${
      R.is(Array, node[1])
        ? printChildren(
            (node[1] as TestDescription[]).map((n: TestDescription) => indentString.concat(printStructure(n as TestStructure, style, indent + 2))),
            style,
          )
        : (node[1] as InternalTestResult).error
          ? indentString.concat(printFail((node[1] as InternalTestResult).error!, style))
          : (node[1] as InternalTestResult).skipped
            ? indentString.concat(printSkip(style))
            : indentString.concat(printPass(style))
    }`;
  };

  const run = async (
    suite: TestSuite, 
    { skippingReason, indent = 0, parentContext, currentPath = [] }: TestOptions & { currentPath?: string[] } = {}
  ): Promise<TestStructure[]> => {
    try {
      const { setup = passThrough, teardown = noop, skip = noop, ...rest } = suite;
      if (caseRegex && !suiteHasMatchingTests(rest as TestSuite, currentPath)) {
        return [];
      }

      // Only evaluate this suite's skip if no ancestor has already marked it as skipped
      if (!skippingReason && skip !== noop) {
        const skipResult = skip();
        if (skipResult && typeof skipResult === 'object' && 'reason' in skipResult && 'until' in skipResult) {
          const skipConfig = skipResult as SkipConfig;
          const skipDate = new Date(skipConfig.until);
          const now = new Date();
          
          if (skipDate > now) {
            skippingReason = skipConfig.reason;
          } else {
            const skipDateString = typeof skipConfig.until === 'string' ? skipConfig.until : skipDate.toISOString();
            const error = `Test skip expired on ${skipDateString}. Reason: ${skipConfig.reason}`;
            
            testResults.push({
              name: currentPath.at(-1)!,
              path: currentPath,
              status: 'failed',
              error
            });

            return [[
              'skip-expired',
              {
                skipped: false,
                error,
              }
            ] as TestStructure];
          }
        }
      }

      let setupResult: TestContext | undefined;
      if (skippingReason === undefined) {
        try {
          setupResult = await setup(parentContext) as TestContext;
        } catch (e) {
          console.error(e);
          return [[
            'setup-error',
            {
              skipped: false,
              error: `Setup failed with: '${(e as Error).toString()}'`,
            }
          ] as TestStructure];
        }
      }

      const result: TestStructure[] = [];
      for (const key of Object.keys(rest)) {
        console.log(
          `${getIndentString(indent)}• ${key} ${
            skippingReason ? `SKIPPING (reason: ${skippingReason})` : ''
          }`.blue,
        );
        const restElement = rest[key];

        let singleResult: InternalTestResult | TestDescription[];
        const timeouts: TimeoutConfig[] = [];
        const testStartTime = Date.now();
        const testPath = [...currentPath, key];

        try {
          if (R.is(Function, restElement)) {
            if (caseRegex && !matchesCaseFilter(testPath)) {
              continue;
            }
            if (skippingReason) {
              singleResult = {
                skipped: skippingReason
              };

              testResults.push({
                name: key,
                path: testPath,
                status: 'skipped'
              });
            } else {
              const assertionTimeout = timeout(setupResult?.timeout || DefaultAssertionTimeout);
              timeouts.push(assertionTimeout);
              const { cancel, promise: timeoutPromise } = assertionTimeout;
              const res = await Promise.race([(restElement as TestFunction)(setupResult), timeoutPromise]);
              const testDuration = Date.now() - testStartTime;
              const testError = res !== undefined ? res : undefined;
              
              singleResult = {
                skipped: false,
                error: testError,
              };
              
              testResults.push({
                name: key,
                path: testPath,
                status: testError ? 'failed' : 'passed',
                error: testError ? testError : undefined,
                duration: testDuration
              });
              
              cancel();
            }
          } else {
            if (caseRegex && !suiteHasMatchingTests(restElement as TestSuite, testPath)) {
              continue;
            }
            const groupTimeout = timeout(setupResult?.timeout || DefaultGroupTimeout);
            timeouts.push(groupTimeout);
            const { cancel, promise: timeoutPromise } = groupTimeout;
            const nestedResults = await run(restElement as TestSuite, { 
              skippingReason, 
              indent: indent + 2, 
              parentContext: setupResult,
              currentPath: [...currentPath, key]
            });
            singleResult = nestedResults as TestDescription[];
            cancel();
          }
        } catch (e) {
          console.error(`Test '${key}' failed:`.red, e);
          const error = (e as Error).message;
          singleResult = { skipped: false, error };

          testResults.push({
            name: key,
            path: testPath,
            status: 'failed',
            error,
            duration: Date.now() - testStartTime
          });
          timeouts.forEach((t) => t.cancel());
        }
        result.push([key, singleResult] as TestStructure);
      }

      if (!skippingReason) {
        try {
          await teardown(setupResult);
        } catch (e) {
          console.error(e);
          throw new Error(`Teardown failed with: '${(e as Error).toString()}'`);
        }
      }

      return result;
    } catch (e) {
      console.error(e);
      throw new Error(`Test group execution failed!: '${(e as Error).toString()}'`);
    }
  };

  try {
    const testFile = getCallerFile();
    const displayTestFile = getDisplayTestFile(testFile || 'unknown', process.env.CASCADE_TEST_BASE_PATH || process.cwd());
    console.log('-'.repeat(60));
    console.log('Running test suite:', displayTestFile);
    console.log('-'.repeat(60), '\n');

    const result = [displayTestFile, await run(suite, { currentPath: [testFile || 'unknown'] })] as TestStructure;
    console.log('\nResults:\n', printStructure(result));
    
    const failedTests = collectFailedTests(result, [], testFile);
    const exitCode = failedTests.length === 0 ? 0 : 1;
    
    // Use reporter to generate output
    reporter.onTestSuiteComplete(testResults, displayTestFile);
    const reporterOutput = reporter.generateOutput();
    // If no output file is configured and a structured reporter is used,
    // print the reporter output to stdout so CI parsers can pick it up
    if ((finalConfig.reporter && finalConfig.reporter !== 'console') && !finalConfig.outputFile) {
      console.log(reporterOutput);
    }
    
    console.log(`\nTest suite (${displayTestFile}) finished ${exitCode === 0 ? 'successfully'.green : `with ${failedTests.length} error(s)`.red}`);

    addCIAnnotations(failedTests, ci);
    
    // Write comprehensive test results to a temporary file for CLI consumption
    const tempFile = path.join(process.cwd(), '.cascade-test-results.json');
    try {
      const testSummary = {
        total: testResults.length,
        passed: testResults.filter(r => r.status === 'passed').length,
        failed: testResults.filter(r => r.status === 'failed').length,
        skipped: testResults.filter(r => r.status === 'skipped').length,
        failedTests: failedTests,
        results: testResults,
        testFile: displayTestFile
      };
      fs.writeFileSync(tempFile, JSON.stringify(testSummary, null, 2));
    } catch (e) {
      // Ignore file write errors
    }
    
    if (failedTests.length > 0) {
      
      failedTests.forEach((failedTest) => {
        const pathString = failedTest.path.slice(1).join(' → ');
        console.log(`\n• ${pathString}`.red);
        if (failedTest.file) {
          const location = failedTest.line ? `${failedTest.file}:${failedTest.line}` : failedTest.file;
          console.log(`  Location: ${location}`.cyan);
        }
        console.log(`  Reason: ${failedTest.error}`.yellow);
      });
      
    }
    console.log('\n');
    
    // Don't exit immediately - let the process exit naturally
    // This allows the parent process to capture the output
    setTimeout(() => process.exit(exitCode), 0);
  } catch (e) {
    console.error(`Test suite execution failed: ${(e as Error).toString()}`.red);
    console.error(e);
  }
};

export default test;