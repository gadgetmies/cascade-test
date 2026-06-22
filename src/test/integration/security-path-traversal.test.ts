import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";

test({
  "Security: Path Traversal Protection": {
    "should prevent path traversal in assertFixture": () => {
      try {
        assertFixture("../traversal-attempt.json", { attempted: true });
        return "VULNERABILITY: Path traversal was not blocked!";
      } catch (error) {
        if (error.message.includes("Security Error: Fixture path '../traversal-attempt.json' is outside the fixtures directory.")) {
          return null; // Passed
        }
        return `Unexpected error message: ${error.message}`;
      }
    },

    "should prevent path traversal with absolute paths": () => {
      try {
        assertFixture("/etc/passwd", { attempted: true });
        return "VULNERABILITY: Absolute path traversal was not blocked!";
      } catch (error) {
        if (error.message.includes("Security Error: Fixture path '/etc/passwd' is outside the fixtures directory.")) {
          return null; // Passed
        }
        return `Unexpected error message: ${error.message}`;
      }
    }
  }
});
