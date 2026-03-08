import { test } from "../../index.js";
import { JUnitReporter, TAPReporter } from "../../lib/reporters.js";
import { TestResult } from "../../types.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test({
  'Security Verification': {
    'JUnitReporter should escape XML special characters in all fields': () => {
      const reporter = new JUnitReporter();
      const results: TestResult[] = [
        {
          name: 'should handle <script>alert(1)</script>',
          path: ['root <&>', 'should handle <script>alert(1)</script>'],
          status: 'failed',
          error: 'Error with "quotes" and & ampersands',
          duration: 100
        }
      ];
      reporter.onTestSuiteComplete(results, 'evil-<suite>.js');
      const output = reporter.generateOutput();

      if (output.includes('name="root <&>"')) {
        return 'JUnitReporter did not escape suite name in output';
      }

      if (output.includes('name="should handle <script>alert(1)</script>"')) {
        return 'JUnitReporter did not escape test name in output';
      }

      if (output.includes('classname="evil-<suite>"')) {
        return 'JUnitReporter did not escape class name in output';
      }

      if (output.includes('message="Error with "quotes"')) {
        return 'JUnitReporter did not escape quotes in failure message';
      }

      if (!output.includes('name="should handle &lt;script&gt;alert(1)&lt;/script&gt;"')) {
        return 'JUnitReporter did not correctly escape test name';
      }
      return;
    },

    'TAPReporter should handle newlines in test names and sanitize output': () => {
      const reporter = new TAPReporter();
      const results: TestResult[] = [
        {
          name: 'test with\nnewline',
          path: ['root', 'test with\nnewline'],
          status: 'passed',
          duration: 100
        }
      ];
      reporter.onTestSuiteComplete(results, 'test.js');
      const output = reporter.generateOutput();

      if (output.includes('test with\nnewline')) {
          return 'TAPReporter did not handle newline in test name';
      }
      return;
    },

    'TAPReporter should properly indent YAML blocks for security and integrity': () => {
        const reporter = new TAPReporter();
        const results: TestResult[] = [
          {
            name: 'fail test',
            path: ['root', 'fail test'],
            status: 'failed',
            error: 'error with\n---\nfake delimiter',
            duration: 100
          }
        ];
        reporter.onTestSuiteComplete(results, 'test.js');
        const output = reporter.generateOutput();

        if (output.includes('\n---\nfake delimiter')) {
            return 'TAPReporter did not indent error message containing YAML delimiter';
        }
        return;
    },

    'fixture-utils should prevent path traversal': () => {
        try {
            // Attempt to access a file outside the fixtures directory
            assertFixture('../../../package.json', {}, {
                fixturesDir: path.resolve(__dirname.replace('/dist/', '/src/'), "fixtures"),
            });
            return 'Should have thrown an error for path traversal';
        } catch (e: any) {
            if (e.message.includes('Security Error') || e.message.includes('outside the fixtures directory')) {
                return;
            }
            if (e.message.includes('Fixture not found')) {
                return 'Path traversal was possible but file was not found (weak protection)';
            }
            return `Unexpected error: ${e.message}`;
        }
    }
  }
});
