import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

test({
  "Path Traversal Security Test": {
    "should not allow reading files outside fixtures directory": () => {
      try {
        // Attempt to read a file outside the fixtures directory using path traversal
        // We use a file that is likely to exist, like package.json
        // Since fixtures are usually in src/test/integration/fixtures/
        // and caller is src/test/integration/security-path-traversal.test.ts
        // the fixtures dir is src/test/integration/fixtures/
        // To get to package.json, we need ../../../package.json
        assertFixture("../../../package.json", {});
        return "Should have thrown a security error, but didn't";
      } catch (error: any) {
        if (error.message.includes("Security Error") || error.message.includes("outside")) {
          return; // Test passed - security error thrown
        }
        return `Expected security error, but got: ${error.message}`;
      }
    }
  }
});
