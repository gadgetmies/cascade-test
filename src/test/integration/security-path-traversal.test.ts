import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test({
  "Security: Path Traversal Protection": {
    "should throw Security Error when path traversal is attempted": (): string | void => {
      try {
        // Attempt to access file outside fixtures directory
        process.env.UPDATE_FIXTURES = "true";
        assertFixture("../../../package.json", { pwned: true });
        return "VULNERABILITY: Path traversal allowed!";
      } catch (e: any) {
        if (e.message.includes("Security Error")) {
           return; // Correctly blocked
        }
        return `FAILED: Unexpected error thrown: ${e.message}`;
      } finally {
        delete process.env.UPDATE_FIXTURES;
      }
    },

    "should throw Security Error when absolute path is used": (): string | void => {
      try {
        process.env.UPDATE_FIXTURES = "true";
        assertFixture("/etc/passwd", { pwned: true });
        return "VULNERABILITY: Absolute path allowed!";
      } catch (e: any) {
        if (e.message.includes("Security Error")) {
           return; // Correctly blocked
        }
        return `FAILED: Unexpected error thrown: ${e.message}`;
      } finally {
        delete process.env.UPDATE_FIXTURES;
      }
    }
  }
});
