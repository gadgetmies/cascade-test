import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";

test({
  "Security Path Traversal Tests": {
    "should prevent path traversal": (): void => {
      try {
        // Attempt to access a file outside the fixtures directory
        assertFixture("../../../package.json", {});
      } catch (err) {
        if ((err as Error).message.includes("Security Error")) {
          return;
        }
        throw err;
      }
      throw new Error("Vulnerability: Path traversal was not blocked");
    },
  },
});
