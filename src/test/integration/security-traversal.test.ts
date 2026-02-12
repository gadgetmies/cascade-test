import { test } from "../../index.js";
import { readFixture } from "../../lib/fixture-utils.js";
import * as fs from "fs";
import * as path from "path";

test({
  "Path Traversal Security Tests": {
    "should not allow reading files outside fixtures directory": () => {
      try {
        // Try to read package.json from the root
        // From src/test/integration/fixtures/, it is ../../../../package.json
        readFixture("../../../../package.json");
        return "Vulnerability: successfully read file outside fixtures directory";
      } catch (error: any) {
        if (error.message.includes("outside fixtures directory")) {
           console.log("Caught expected security error:", error.message);
           return;
        }
        return `Unexpected error: ${error.message}`;
      }
    }
  }
});
