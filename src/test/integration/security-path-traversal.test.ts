import { test } from "../../index.js";
import { readFixture } from "../../lib/fixture-utils.js";

test({
  "Security: Path Traversal": {
    "should prevent path traversal to sensitive files": () => {
      try {
        // Attempt to read package.json which is several levels up
        readFixture("../../../package.json");
        throw new Error("Vulnerability: Successfully read package.json via path traversal!");
      } catch (e: any) {
        if (e.message.includes("Security Error")) {
          return; // Success, it was blocked with the correct error
        }
        throw e; // Unexpected error
      }
    }
  }
});
