import { test } from "../../index.js";
import { assertFixture, readFixture, createFixture } from "../../lib/fixture-utils.js";
import * as path from "path";
import * as fs from "fs";

test({
  "Path Traversal Vulnerability": {
    "should not allow reading files outside fixtures directory": () => {
      try {
        // Attempt to read package.json using path traversal
        readFixture("../../../package.json");
        return "Vulnerability exploited: readFixture allowed path traversal";
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Success: Security error thrown
        }
        return `Expected 'Security Error', but got: ${error.message}`;
      }
    },

    "should not allow writing files outside fixtures directory": () => {
      const traversalPath = "../../../pwned.json";
      try {
        createFixture(traversalPath, { pwned: true });

        // Clean up if it actually succeeded (which it shouldn't)
        const absolutePath = path.resolve(process.cwd(), "pwned.json");
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          return "Vulnerability exploited: createFixture allowed path traversal and wrote a file";
        }
        return "Vulnerability exploited: createFixture allowed path traversal (though file might not have been written)";
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Success
        }
        return `Expected 'Security Error', but got: ${error.message}`;
      }
    }
  }
});
