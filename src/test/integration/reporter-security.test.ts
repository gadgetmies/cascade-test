
import { test } from "../../index.js";
import { TestContext } from "../../types.js";
import * as path from "path";
import { fileURLToPath } from "url";
import { runTestFile } from "../../lib/test-utils.js";
import * as os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test({
  "Reporter Security Tests": {
    "JUnit Escaping": {
      setup: async () => {
        const securityTestPath = path.resolve(__dirname, '../examples/security-escaping.test.js');
        const tempFile = path.join(os.tmpdir(), `cascade-test-security-junit-${Date.now()}.xml`);
        const result = await runTestFile(securityTestPath, 'junit', tempFile);
        return { result };
      },
      "should escape special characters in JUnit output": (context?: TestContext): string | void => {
        const output = context!.result.reporterOutput;
        // Verify escaping of < > & " '
        if (!output.includes('&lt;') || !output.includes('&gt;') || !output.includes('&amp;') || !output.includes('&quot;') || !output.includes('&#39;')) {
          return "JUnit output did not contain expected XML entities for special characters";
        }

        // Check for specific escaped test name
        if (!output.includes('should escape XML special characters in JUnit reporter: &lt; &gt; &amp; &quot; &#39;')) {
          return "JUnit output did not correctly escape the test name";
        }

        // Check for escaped error message
        if (!output.includes('message="Failure message with &lt; &gt; &amp; &quot; &#39; characters"')) {
          return "JUnit output did not correctly escape the failure message";
        }
      }
    },
    "TAP Robustness": {
      setup: async () => {
        const securityTestPath = path.resolve(__dirname, '../examples/security-escaping.test.js');
        const tempFile = path.join(os.tmpdir(), `cascade-test-security-tap-${Date.now()}.tap`);
        const result = await runTestFile(securityTestPath, 'tap', tempFile);
        return { result };
      },
      "should handle newlines in TAP output": (context?: TestContext): string | void => {
        const output = context!.result.reporterOutput;
        // Verify that the newline-carrying message is indented
        if (!output.includes('message: First line\n    Second line')) {
          return "TAP output did not correctly indent multiline error message";
        }
      }
    }
  }
});
