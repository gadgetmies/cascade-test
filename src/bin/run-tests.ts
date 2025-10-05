#!/usr/bin/env node
import * as R from 'ramda';
import { recursivelyFindByRegex } from '../lib/file-utils';
import { fork, ChildProcess } from 'child_process';
import yargsFactory from 'yargs/yargs';
import type { Argv, ArgumentsCamelCase } from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as path from 'path';
import 'colors';

interface TestResult {
  test: string;
  code: number;
}

const runTest = (test: string): Promise<number> => {
  const child: ChildProcess = fork(test);

  return new Promise<number>(function (resolve: (value: number) => void, reject: (reason?: Error) => void) {
    child.addListener('error', reject);
    child.addListener('exit', resolve);
  });
};

const main = async (testPath: string, regex: RegExp = /\.(js|ts)$/): Promise<void> => {
  const testFiles = recursivelyFindByRegex(path.resolve(`${process.cwd()}/${testPath}`), regex);

  const exitStatuses: TestResult[] = [];
  for (const test of testFiles) {
    try {
      const code = await runTest(test);
      exitStatuses.push({ test, code });
    } catch (e) {
      console.error(`${test} execution failed!`, e);
      exitStatuses.push({ test, code: -1 });
    }
  }

  const failedTests = R.reject(R.propEq(0, 'code'), exitStatuses);
  if (failedTests.length !== 0) {
    console.error(`${failedTests.length} tests failed:`.red);
    for (const { test } of failedTests) {
      console.error(`• ${test}`.red);
    }
    process.exit(1);
  }

  console.log('All tests passed!'.green);
  process.exit(0);
};

const cli = yargsFactory(hideBin(process.argv)) as Argv;

cli
  .usage('Usage: $0 <path> [options]')
  .command<{ path: string; regex?: string }>(
    '$0 <path>',
    'Runs tests in path filtered by regex if given',
    (y: Argv<{}>) =>
      y
        .positional('path', {
          description: 'Path to test files. Searched recursively.',
          type: 'string',
          demandOption: true,
        })
        .option('regex', {
          description: 'Regex to filter files with',
          alias: 'r',
          type: 'string',
        }),
    async (argv: ArgumentsCamelCase<{ path: string; regex?: string }>) => {
      return await main(argv.path, argv.regex ? new RegExp(argv.regex) : /\.(js|ts)$/);
    },
  )
  .help()
  .alias('help', 'h').argv;