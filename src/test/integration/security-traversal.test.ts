import { test } from "../../index.js";
import { assertFixture, createFixture, readFixture } from "../../lib/fixture-utils.js";
import path from "path";
import fs from "fs";

test({
  "Security: Path Traversal": {
    "should not allow reading files outside fixtures directory": () => {
      try {
        // Attempt to read a file outside the fixtures directory
        // We'll try to read the package.json which should be a few levels up
        readFixture("../../../package.json");
        return "Should have thrown an error for path traversal";
      } catch (error: any) {
        if (error.message.includes("Access denied") || error.message.includes("outside the fixtures directory")) {
          return; // Successfully blocked
        }
        // If it failed because the file wasn't found, it's still technically vulnerable
        // because it tried to access it. But our goal is to explicitly block it.
        if (error.message.includes("Fixture not found")) {
            return "Vulnerable: Attempted to access path outside fixtures directory";
        }
        return `Unexpected error: ${error.message}`;
      }
    },

    "should not allow creating files outside fixtures directory": () => {
      const secretFile = path.resolve(process.cwd(), "pwned.txt");
      try {
        createFixture("../../../pwned.txt", { pwned: true });

        if (fs.existsSync(secretFile)) {
          fs.unlinkSync(secretFile);
          return "Vulnerable: Successfully created a file outside the fixtures directory";
        }
        return "Should have thrown an error for path traversal";
      } catch (error: any) {
        if (error.message.includes("Access denied") || error.message.includes("outside the fixtures directory")) {
          return; // Successfully blocked
        }
        return `Unexpected error: ${error.message}`;
      }
    }
  }
});
