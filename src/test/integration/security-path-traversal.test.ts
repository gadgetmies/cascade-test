import { test } from "../../index.js";
import { assertFixture, createFixture, readFixture } from "../../lib/fixture-utils.js";

test({
  "Security: Path Traversal Protection": {
    "should prevent absolute path traversal in assertFixture": () => {
      try {
        assertFixture("/etc/passwd", { data: "test" });
        return "FAILED: Should have thrown a security error for absolute path";
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Passed
        }
        return `FAILED: Unexpected error message: ${error.message}`;
      }
    },

    "should prevent relative path traversal in assertFixture": () => {
      try {
        assertFixture("../../../package.json", { data: "test" });
        return "FAILED: Should have thrown a security error for relative path traversal";
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Passed
        }
        return `FAILED: Unexpected error message: ${error.message}`;
      }
    },

    "should prevent absolute path traversal in createFixture": () => {
      try {
        createFixture("/tmp/malicious.json", { data: "test" });
        return "FAILED: Should have thrown a security error for absolute path";
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Passed
        }
        return `FAILED: Unexpected error message: ${error.message}`;
      }
    },

    "should prevent relative path traversal in readFixture": () => {
      try {
        readFixture("../../../package.json");
        return "FAILED: Should have thrown a security error for relative path traversal";
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Passed
        }
        return `FAILED: Unexpected error message: ${error.message}`;
      }
    }
  }
});
