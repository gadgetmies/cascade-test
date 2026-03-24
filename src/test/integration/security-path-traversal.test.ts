import { readFixture } from "../../lib/fixture-utils.js";
import test from "../../lib/test.js";

test({
  "Security Path Traversal Tests": {
    "should not allow reading files outside fixtures directory via relative path": () => {
      try {
        // Try to read package.json which is a few levels up
        const data = readFixture("../../../../package.json");
        if (data && data.name === "cascade-test") {
          return "VULNERABILITY: Successfully read package.json via relative path traversal!";
        }
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Success, we blocked it
        }
        return "Failed with non-security error: " + error.message;
      }
      return "FAILED: Did not throw any error for relative path!";
    },

    "should not allow reading files via absolute path": () => {
      try {
        // Try to read /etc/passwd (on linux-based environments)
        // or just some absolute path we know exists like process.cwd() + '/package.json'
        const absPath = process.cwd() + '/package.json';
        const data = readFixture(absPath);
        if (data && data.name === "cascade-test") {
          return "VULNERABILITY: Successfully read package.json via absolute path!";
        }
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Success, we blocked it
        }
        return "Failed with non-security error: " + error.message;
      }
      return "FAILED: Did not throw any error for absolute path!";
    }
  }
});
