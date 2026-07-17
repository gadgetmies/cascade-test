import { test } from "../../index.js";
import { isPathSafe } from "../../lib/path-utils.js";
import { expect } from "chai";

test({
  "Security Path Traversal": {
    "isPathSafe should block unsafe paths": () => {
      expect(isPathSafe("../outside")).to.be.false;
      expect(isPathSafe("inside/path")).to.be.true;
    }
  }
});
