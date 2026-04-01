import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import * as path from "path";
import * as os from "os";

test({
  "Security: Path Traversal Tests": {
    "should prevent path traversal to parent directories": () => {
      try {
        // Attempt to access package.json which is likely 3 levels up from src/test/integration/fixtures
        // (src/test/integration/fixtures -> src/test/integration -> src/test -> src -> root)
        // Actually from src/test/integration/fixture-utils.test.ts, it resolves fixtures relative to itself.
        // So it's src/test/integration/fixtures.
        // ../../../package.json would be root/package.json
        assertFixture("../../../package.json", {});
        return "Failed: Should have thrown a Security Error";
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Success: blocked by security check
        }
        if (error.message.includes("Fixture mismatch")) {
          return "Failed: Traversal succeeded but failed on content mismatch. This is a security vulnerability.";
        }
        throw error;
      }
    },

    "should prevent absolute paths in fixture names": () => {
      const absolutePath = path.resolve(os.tmpdir(), "security-test.json");
      try {
        assertFixture(absolutePath, {});
        return "Failed: Should have thrown a Security Error for absolute path";
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Success: blocked by security check
        }
        throw error;
      }
    }
  }
});
