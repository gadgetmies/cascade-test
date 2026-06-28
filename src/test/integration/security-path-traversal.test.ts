import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";

test({
  "Path Traversal Test": {
    "should fail when trying to access file outside CWD": () => {
        try {
            // Using many levels of .. to ensure we go above CWD
            assertFixture("../../../../../../../../../etc/passwd", {});
            return "Should have thrown a security error";
        } catch (e: any) {
            if (e.message.includes("Security Error")) {
                return null;
            }
            throw e;
        }
    }
  }
});
