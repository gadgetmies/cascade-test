import { test } from "../../index.js";
import { readFixture, assertFixture, createFixture } from "../../lib/fixture-utils.js";
import * as path from "path";

test({
  "Security: Path Traversal Protection": {
    "readFixture should block path traversal": () => {
      try {
        readFixture("../../../package.json");
        return "Security Error: Traversal should have been blocked";
      } catch (error: any) {
        if (!error.message.includes("Security Error")) {
          return `Unexpected error message: ${error.message}`;
        }
      }
      return;
    },

    "assertFixture should block path traversal": () => {
      try {
        assertFixture("../../../package.json", {});
        return "Security Error: Traversal should have been blocked";
      } catch (error: any) {
        if (!error.message.includes("Security Error")) {
          return `Unexpected error message: ${error.message}`;
        }
      }
      return;
    },

    "createFixture should block path traversal": () => {
      try {
        createFixture("../../../vulnerable.json", {});
        return "Security Error: Traversal should have been blocked";
      } catch (error: any) {
        if (!error.message.includes("Security Error")) {
          return `Unexpected error message: ${error.message}`;
        }
      }
      return;
    },

    "should block absolute paths": () => {
        const absolutePath = path.resolve("/etc/passwd");
        try {
          readFixture(absolutePath);
          return "Security Error: Absolute path should have been blocked";
        } catch (error: any) {
          if (!error.message.includes("Security Error")) {
            return `Unexpected error message: ${error.message}`;
          }
        }
        return;
    }
  }
});
