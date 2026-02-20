import { test } from "../../index.js";
import { readFixture } from "../../lib/fixture-utils.js";

test({
  "Path Traversal Security Test": {
    "should not allow reading files outside of fixtures directory": () => {
      try {
        // Attempt to read package.json using path traversal from the fixtures dir
        readFixture("../../../package.json");
        return "Should have thrown an error for path traversal";
      } catch (error) {
        if ((error as Error).message.includes("Access denied")) {
          return undefined; // Passed
        }
        return `Unexpected error: ${(error as Error).message}`;
      }
    }
  }
});
