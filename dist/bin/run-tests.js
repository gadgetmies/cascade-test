#!/usr/bin/env node
import * as R from 'ramda';
import { recursivelyFindByRegex } from '../lib/file-utils.js';
import { fork } from 'child_process';
import yargsFactory from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import * as path from 'path';
import * as fs from 'fs';
import 'colors';
const runTest = (test, config = {}) => {
    const child = fork(test, [], {
        env: {
            ...process.env,
            CASCADE_TEST_REPORTER: config.reporter || 'console',
            CASCADE_TEST_OUTPUT: config.outputFile || '',
            CASCADE_TEST_CI: config.ci || 'auto'
        }
    });
    let output = '';
    return new Promise(function (resolve, reject) {
        child.stdout?.on('data', (data) => {
            output += data.toString();
        });
        child.stderr?.on('data', (data) => {
            output += data.toString();
        });
        child.addListener('error', reject);
        child.addListener('exit', (code) => {
            resolve({ test, code: code || 0, output });
        });
    });
};
const parseFailedTests = (output) => {
    const failedTests = [];
    // Split output into lines and look for the FAILED TESTS section
    const lines = output.split('\n');
    let inFailedTestsSection = false;
    let currentTest = {};
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('FAILED TESTS')) {
            inFailedTestsSection = true;
            continue;
        }
        if (inFailedTestsSection && line.includes('='.repeat(60))) {
            // End of section
            if (currentTest.path && currentTest.error) {
                failedTests.push({
                    path: currentTest.path,
                    error: currentTest.error
                });
            }
            break;
        }
        if (inFailedTestsSection) {
            // Look for test path line: • path → path → path
            if (line.trim().startsWith('•') && line.includes('→')) {
                if (currentTest.path && currentTest.error) {
                    failedTests.push({
                        path: currentTest.path,
                        error: currentTest.error
                    });
                }
                currentTest = { path: line.trim().substring(1).trim() };
            }
            // Look for error line: Error: message
            else if (line.trim().startsWith('Error:')) {
                currentTest.error = line.trim().substring(6).trim();
            }
        }
    }
    return failedTests;
};
const main = async (testPath, regex = /\.(js|ts)$/, config = {}) => {
    const testFiles = recursivelyFindByRegex(path.resolve(`${process.cwd()}/${testPath}`), regex);
    const exitStatuses = [];
    for (const test of testFiles) {
        try {
            const result = await runTest(test, config);
            exitStatuses.push(result);
        }
        catch (e) {
            console.error(`${test} execution failed!`, e);
            exitStatuses.push({ test, code: -1 });
        }
    }
    const failedTests = R.reject(R.propEq(0, 'code'), exitStatuses);
    if (failedTests.length !== 0) {
        console.log('\n' + '='.repeat(60).red);
        console.log('FAILED TESTS'.red.bold);
        console.log('='.repeat(60).red);
        for (const { test, output } of failedTests) {
            // Try to read failed test information from temporary file
            const tempFile = path.join(process.cwd(), '.cascade-test-failures.json');
            try {
                if (fs.existsSync(tempFile)) {
                    const failedTestData = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
                    for (const failedTest of failedTestData) {
                        console.log(`\n• ${failedTest.path.join(' → ')}`.red);
                        console.log(`  Error: ${failedTest.error}`.yellow);
                    }
                    // Clean up the temporary file
                    fs.unlinkSync(tempFile);
                }
            }
            catch (e) {
                // Fall back to parsing output if file reading fails
                if (output) {
                    const parsedFailedTests = parseFailedTests(output);
                    for (const failedTest of parsedFailedTests) {
                        console.log(`\n• ${failedTest.path}`.red);
                        console.log(`  Error: ${failedTest.error}`.yellow);
                    }
                }
            }
        }
        console.log('\n' + '='.repeat(60).red);
        process.exit(1);
    }
    console.log('All tests passed!'.green);
    process.exit(0);
};
const cli = yargsFactory(hideBin(process.argv));
cli
    .usage('Usage: $0 <path> [options]')
    .command('$0 <path>', 'Runs tests in path filtered by regex if given', (y) => y
    .positional('path', {
    description: 'Path to test files. Searched recursively.',
    type: 'string',
    demandOption: true,
})
    .option('regex', {
    description: 'Regex to filter files with',
    alias: 'r',
    type: 'string',
})
    .option('reporter', {
    description: 'Test reporter to use',
    type: 'string',
    choices: ['console', 'junit', 'tap', 'json'],
    default: 'console',
})
    .option('output', {
    description: 'Output file for structured reporters',
    alias: 'o',
    type: 'string',
})
    .option('ci', {
    description: 'CI environment for annotations',
    type: 'string',
    choices: ['jenkins', 'azure', 'gitlab', 'github', 'console', 'auto'],
    default: 'auto',
}), async (argv) => {
    return await main(argv.path, argv.regex ? new RegExp(argv.regex) : /\.(js|ts)$/, {
        reporter: argv.reporter,
        outputFile: argv.output,
        ci: argv.ci === 'auto' ? undefined : argv.ci
    });
})
    .help()
    .alias('help', 'h').argv;
//# sourceMappingURL=run-tests.js.map