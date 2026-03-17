import { test } from "../../index.js";
import { createFixture } from "../../lib/fixture-utils.js";
import * as path from "path";

test({
  "Security Path Traversal Tests": {
    "should throw security error for traversal in fixture name": () => {
        const fixtureName = "../../../package.json";
        try {
            createFixture(fixtureName, { pwned: true });
            return "VULNERABLE: createFixture should have thrown a Security Error for traversal path";
        } catch (e: any) {
            if (e.message === "Security Error: Fixture path must be within the fixtures directory") {
                return; // Success
            }
            // If it's not our security error, it might be a file system error because it tried to write where it shouldn't
            // but we want to SPECIFICALLY catch the security error once implemented.
            return `Expected Security Error, but got: ${e.message}`;
        }
    }
  }
});
