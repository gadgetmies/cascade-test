import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import path from "path";

test({
  "Security: Path Traversal Protection": {
    "should block absolute path traversal": () => {
      const absolutePath = path.resolve(process.cwd(), "package.json");
      try {
        assertFixture(absolutePath, {});
        return "Should have thrown a Security Error for absolute path";
      } catch (error: any) {
        if (!error.message.includes("Security Error") && !error.message.includes("must be a relative path")) {
          return `Unexpected error message: ${error.message}`;
        }
      }
      return;
    },

    "should block relative path traversal": () => {
      const traversalPath = "../../../package.json";
      try {
        assertFixture(traversalPath, {});
        return "Should have thrown a Security Error for relative path traversal";
      } catch (error: any) {
        if (!error.message.includes("Security Error") && !error.message.includes("path traversal attempt detected")) {
          return `Unexpected error message: ${error.message}`;
        }
      }
      return;
    },

    "should allow legitimate relative paths within fixtures": {
      "should allow simple filename": () => {
        // user-data.json already exists in integration fixtures
        assertFixture("user-data.json", {
          name: "Test User",
          email: "test@example.com",
          age: 30,
          preferences: {
            theme: "dark",
            notifications: true,
          },
        });
        return;
      },
      "should allow paths in subdirectories": () => {
        // This will create a file in fixtures/security/test.json if UPDATE_FIXTURES is true
        // but here we just want to ensure it doesn't throw a Security Error
        try {
           assertFixture("security/test.json", {});
        } catch (error: any) {
           if (error.message.includes("Security Error")) {
             return `Should not have thrown a Security Error for nested fixture: ${error.message}`;
           }
           // Other errors (like Fixture not found) are acceptable here
        }
        return;
      }
    }
  }
});
