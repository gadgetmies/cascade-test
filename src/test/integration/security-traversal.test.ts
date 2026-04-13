import { test } from "../../index.js";
import {
  createFixture,
  readFixture,
} from "../../lib/fixture-utils.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test({
  "Security: Path Traversal": {
    "should block reading files outside fixtures directory": () => {
      // getFixtureDir will be /app/src/test/integration/fixtures
      // We want to reach /app/src/secret-test.txt
      // fixtures/../../secret-test.txt -> src/test/secret-test.txt
      const secretPath = path.resolve(__dirname, "../secret-test.txt");
      fs.writeFileSync(secretPath, JSON.stringify({ secret: "data" }), "utf8");

      try {
        // readFixture will look in /app/src/test/integration/fixtures/../../secret-test.txt
        // which resolves to /app/src/test/secret-test.txt
        readFixture("../../secret-test.txt");
        return "Vulnerable: successfully read file outside fixtures directory";
      } catch (error) {
        if (error.message.includes("Security Error")) {
          return null; // Passed security check
        }
        return `Unexpected error: ${error.message}`;
      } finally {
        if (fs.existsSync(secretPath)) {
          fs.unlinkSync(secretPath);
        }
      }
    },

    "should block writing files outside fixtures directory": () => {
      const pwnedPath = path.resolve(__dirname, "../pwned-test.txt");

      try {
        createFixture("../../pwned-test.txt", { pwned: true });
        if (fs.existsSync(pwnedPath)) {
          fs.unlinkSync(pwnedPath);
          return "Vulnerable: successfully wrote file outside fixtures directory";
        }
        return "Failed to write file but no error thrown";
      } catch (error) {
        if (error.message.includes("Security Error")) {
          return null; // Passed security check
        }
        return `Unexpected error: ${error.message}`;
      }
    }
  }
});
