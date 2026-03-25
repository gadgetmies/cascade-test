import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

test({
  "Security: Path Traversal Protection": {
    "should block absolute paths": () => {
      const absolutePath = path.resolve(os.tmpdir(), "some-fixture.json");
      try {
        assertFixture(absolutePath, { data: "test" });
        return "Failed: Should have blocked absolute path";
      } catch (error: any) {
        if (error.message.includes("Security Error") && error.message.includes("Absolute paths are not allowed")) {
          return; // Success: blocked correctly
        }
        return `Failed: Unexpected error message: ${error.message}`;
      }
    },

    "should block relative path traversal": () => {
      try {
        assertFixture("../../../package.json", { data: "test" });
        return "Failed: Should have blocked path traversal";
      } catch (error: any) {
        if (error.message.includes("Security Error") && error.message.includes("path traversal detected")) {
          return; // Success: blocked correctly
        }
        return `Failed: Unexpected error message: ${error.message}`;
      }
    },

    "should block traversing to sibling directory": () => {
        // Attempt to access a file in a sibling directory of 'fixtures'
        // If fixturesDir is 'fixtures', then '../other/file.json' is outside.
        try {
          assertFixture("../other-dir/secret.json", { data: "test" });
          return "Failed: Should have blocked traversal to sibling directory";
        } catch (error: any) {
          if (error.message.includes("Security Error") && error.message.includes("path traversal detected")) {
            return; // Success: blocked correctly
          }
          return `Failed: Unexpected error message: ${error.message}`;
        }
      }
  }
});
