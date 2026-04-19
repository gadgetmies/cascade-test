import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";

test({
  "Fixture Utility Security Tests": {
    "should prevent path traversal outside fixtures directory": () => {
      try {
        assertFixture("../outside.json", { leaked: "data" });
        return "Should have thrown a Security Error";
      } catch (error: any) {
        if (!error.message.includes("Security Error")) {
          return `Expected Security Error, got: ${error.message}`;
        }
      }
    },

    "should prevent absolute path traversal": () => {
      try {
        assertFixture("/etc/passwd", { leaked: "data" });
        return "Should have thrown a Security Error";
      } catch (error: any) {
        if (!error.message.includes("Security Error")) {
          return `Expected Security Error, got: ${error.message}`;
        }
      }
    },

    "should allow valid fixture names": () => {
        // This should not throw if we have a way to avoid writing/reading a real file,
        // or we just use a known good one.
        // Actually, assertFixture will try to read it.
        // We can use an existing one.
        assertFixture("user-data.json", {
            name: "Test User",
            email: "test@example.com",
            age: 30,
            preferences: {
              theme: "dark",
              notifications: true,
            },
          });
    }
  }
});
