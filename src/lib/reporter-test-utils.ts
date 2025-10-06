// Using any to avoid import issues with TestContext
import { assertFixture, normalizeConfig } from './fixture-utils.js';
import { runTestFile, TestRunResult } from './test-utils.js';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ReporterTestConfig {
  reporterName: string;
  reporterType: string;
  fixtureName: string;
  outputFileName?: string;
}

export const setupReporterTest = async (config: ReporterTestConfig): Promise<{ config: ReporterTestConfig; result: TestRunResult }> => {
    const exampleTestPath = path.resolve(__dirname, '../test/examples/example.test.js');
    const tempFile = path.join(os.tmpdir(), `cascade-test-${config.reporterType}-${Date.now()}.tmp`);

    const result = await runTestFile(exampleTestPath, config.reporterType, tempFile);
    
    if (!result.reporterOutput) {
        throw new Error(`${config.reporterName} reporter did not generate output`);
    }
    
    if (config.reporterType === 'json' || config.reporterType === 'mocha-json') {
        try {
            result.reporterOutput = JSON.parse(result.reporterOutput);
        } catch (e) {
            throw new Error(`${config.reporterName} output is not valid JSON`);
        }
    }
    
    return {
        config,
        result
    };
}

export const normalizationConfigs = {
  json: {
    testFile: '[TEST_FILE_PATH]'
  },
  
  junit: {
    'file:///.*?/example.test.js': '[TEST_FILE_PATH]',
    'time="[^"]*"': 'time="[TIMESTAMP]"',
    'timestamp="[^"]*"': 'timestamp="[TIMESTAMP]"'
  },
  
  tap: {
    'ok \\d+': 'ok [TEST_NUMBER]',
    'not ok \\d+': 'not ok [TEST_NUMBER]',
    '# duration: \\d+ms': '# duration: [DURATION]ms'
  },
  
  mochaJson: {
    'file:///.*?/example.test.js': '[TEST_FILE_PATH]',
    'start': '[TIMESTAMP]',
    'end': '[TIMESTAMP]',
    'duration': '[DURATION]'
  }
};
