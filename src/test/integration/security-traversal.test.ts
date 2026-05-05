import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";

export default test({
  "Security: Path Traversal": {
    "should block traversal in assertFixture": () => {
      try {
        assertFixture("../../../package.json", {});
        return "Should have thrown a Security Error";
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Passed
        }
        return `Unexpected error: ${error.message}`;
      }
    },

    "should block absolute paths in assertFixture": () => {
      try {
        assertFixture("/etc/passwd", {});
        return "Should have thrown a Security Error";
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Passed
        }
        return `Unexpected error: ${error.message}`;
      }
    }
  }
});
