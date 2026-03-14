import { test } from "../../index.js";
import { JUnitReporter } from "../../lib/reporters.js";
import { TestResult } from "../../types.js";

test({
  "JUnit Reporter Security Enhancement": {
    "should escape test names and class names in JUnit report": (): string | void => {
      const reporter = new JUnitReporter();
      const mockResults: TestResult[] = [
        {
          name: 'test " name < > &',
          path: ['root', 'test " name < > &'],
          status: 'passed',
          duration: 100
        }
      ];

      const testFile = 'some/path/file " with < > & chars.test.ts';

      reporter.onTestSuiteComplete(mockResults, testFile);
      const output = reporter.generateOutput();

      if (!output.includes('name="test &quot; name &lt; &gt; &amp;"')) {
        return "Special characters not escaped in testcase name:\n" + output;
      }

      if (!output.includes('classname="file &quot; with &lt; &gt; &amp; chars.test"')) {
        return "Special characters not escaped in classname:\n" + output;
      }
    }
  }
});
