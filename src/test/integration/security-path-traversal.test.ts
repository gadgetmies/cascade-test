import { test } from "../../index.js";
import { readFixture, createFixture } from "../../lib/fixture-utils.js";
import path from "path";
import fs from "fs";
import os from "os";

test({
  "Security: Path Traversal": {
    "should not allow reading files outside fixtures directory": () => {
      try {
        // Attempt to read package.json using path traversal
        // fixturesDir defaults to 'fixtures' relative to the test file
        readFixture("../../../package.json");
        return "Should have thrown a security error for path traversal";
      } catch (error: any) {
        if (error.message.includes("Security Error") || error.message.includes("is outside the fixtures directory")) {
           return; // Success, it's blocked (once we implement the fix)
        }
        if (error.message.includes("Fixture not found") || error.message.includes("Unexpected token")) {
            // It actually tried to read it and failed because it's not JSON or not found where it expected
            // but the point is it DID NOT block the traversal itself
            return "Traversal was not blocked: " + error.message;
        }
        throw error;
      }
    },
    "should not allow writing files outside fixtures directory": () => {
        const tmpFile = path.join(os.tmpdir(), `traversal-test-${Date.now()}.txt`);
        const relativePath = path.relative(path.join(process.cwd(), 'src/test/integration/fixtures'), tmpFile);

        try {
            createFixture(relativePath, { malicious: true });
            if (fs.existsSync(tmpFile)) {
                fs.unlinkSync(tmpFile);
                return "Should not have been able to write to " + tmpFile;
            }
            return "Should have thrown a security error";
        } catch (error: any) {
            if (error.message.includes("Security Error") || error.message.includes("is outside the fixtures directory")) {
                return; // Success
            }
            throw error;
        }
    }
  }
});
