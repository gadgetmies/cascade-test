import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import * as path from "path";

test({
  "Security: Path Traversal Protection": {
    "should block path traversal attempts with '..'": (): string | void => {
      try {
        assertFixture("../../../package.json", {});
        return "Security Error: Should have blocked path traversal";
      } catch (e: any) {
        if (!e.message.includes("Security Error")) {
          return `Expected Security Error, but got: ${e.message}`;
        }
      }
      return;
    },

    "should block absolute path attempts": (): string | void => {
      const absolutePath = path.resolve("/etc/passwd");
      try {
        assertFixture(absolutePath, {});
        return "Security Error: Should have blocked absolute path";
      } catch (e: any) {
        if (!e.message.includes("Security Error")) {
          return `Expected Security Error, but got: ${e.message}`;
        }
      }
      return;
    },

    "should allow valid relative paths within fixtures directory": (): string | void => {
      // This should pass if the fixture exists or if we're not updating.
      // We'll use a known existing fixture from another test.
      try {
        assertFixture("user-data.json", {
            "name": "Test User",
            "email": "test@example.com",
            "age": 30,
            "preferences": {
              "theme": "dark",
              "notifications": true
            }
          });
      } catch (e: any) {
        return `Should have allowed valid fixture: ${e.message}`;
      }
      return;
    }
  }
});
