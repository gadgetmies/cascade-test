import { test } from "../../index.js";
import { readFixture } from "../../lib/fixture-utils.js";

test({
  "Path Traversal Vulnerability": {
    "should not be able to read files outside fixtures directory": () => {
      try {
        // Attempt to read package.json using path traversal
        // From src/test/integration/fixtures, package.json is at ../../../../package.json
        readFixture("../../../../package.json");
        return "VULNERABILITY: Successfully read package.json via path traversal!";
      } catch (e: any) {
        if (e.message.includes("Security Error") && e.message.includes("outside of the allowed directory")) {
             // Success: The security check blocked the traversal
             return;
        }
        return "Unexpected error message: " + e.message;
      }
    }
  }
});
