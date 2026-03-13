import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

test({
  "Security Path Traversal Repro": {
    "should not allow writing outside fixtures directory": () => {
      // Use a temporary file in the OS temp directory instead of project root
      const tempDir = os.tmpdir();
      const targetFile = path.resolve(tempDir, `cascade-test-pwned-${Date.now()}.txt`);

      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
      }

      // We need to set UPDATE_FIXTURES env var for assertFixture to write
      process.env["UPDATE_FIXTURES"] = "true";

      let errorThrown = false;
      try {
        // Try to write to a file outside the fixtures directory using the absolute path to temp file
        // The fixture utility will join this with the fixtures directory, so we use enough ../ to reach root
        const traversalPath = "../../../../../../../../../../../../../../../../../" + targetFile;
        assertFixture(traversalPath, { pwned: true });
      } catch (e: any) {
        errorThrown = true;
        if (!e.message.includes("Security Error")) {
          throw new Error(`Expected Security Error, but got: ${e.message}`);
        }
      } finally {
        delete process.env["UPDATE_FIXTURES"];
      }

      if (!errorThrown) {
        throw new Error("VULNERABILITY DETECTED: assertFixture did not throw an error for path traversal");
      }

      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
        throw new Error("VULNERABILITY DETECTED: Arbitrary file write via path traversal in assertFixture");
      }
    }
  }
});
