import { test } from "../../index.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { isPathSafe } from "../../lib/path-utils.js";
import * as path from "path";

test({
  "Security Path Validation": {
    "isPathSafe utility": () => {
      const cwd = process.cwd();
      if (!isPathSafe("src", cwd)) return "Should allow 'src'";
      if (isPathSafe("..", cwd)) return "Should block '..'";
      if (isPathSafe(path.join(cwd, ".."), cwd)) return "Should block parent dir";
      if (isPathSafe("/", cwd)) return "Should block root dir";
      if (isPathSafe(cwd, cwd)) return "Should block CWD itself";
      return null;
    },
    "assertFixture blocks traversal": () => {
      try {
        assertFixture("../../../package.json", {});
        return "Should have thrown Security Error";
      } catch (e: any) {
        if (e.message.includes("Security Error")) return null;
        return "Unexpected error: " + e.message;
      }
    }
  }
});
