import { test } from "../../index.js";
import { readFixture, createFixture, assertFixture } from "../../lib/fixture-utils.js";

test({
  "Security: Path Traversal": {
    "should not be able to read/write/assert files outside fixtures directory": () => {
      const maliciousPath = "../../../../package.json";
      const check = (fn: () => void): string | void => {
        try {
          fn();
          return "VULNERABILITY: Operation succeeded via path traversal!";
        } catch (error) {
          if (!(error instanceof Error && error.message.includes("Access denied"))) {
            return `Expected "Access denied", got: ${error instanceof Error ? error.message : error}`;
          }
        }
      };

      const results = [
        check(() => readFixture(maliciousPath)),
        check(() => createFixture("../../../../malicious.json", {})),
        check(() => assertFixture(maliciousPath, {}))
      ];

      return results.find(r => r !== undefined);
    }
  }
});
