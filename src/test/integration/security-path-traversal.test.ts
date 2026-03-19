import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test({
  "Security: Path Traversal": {
    "should not allow accessing files outside fixtures directory": () => {
      // This should fail after we fix the vulnerability
      // For now, it will probably attempt to read the package.json if it exists at that relative path
      try {
        assertFixture("../../../package.json", {});
      } catch (error: any) {
        if (error.message.includes("Security Error")) {
          return; // Success, it's blocked
        }
        throw error;
      }
    }
  }
});
