import test from "../../lib/test.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { expect } from "chai";

export default test({
  "Fixture Path Traversal": {
    "should block traversal in fixture name": () => {
      expect(() => assertFixture("../outside.json", {})).to.throw(
        "Security Error: Fixture name '../outside.json' is invalid or attempts to traverse outside the fixtures directory."
      );
    },
  },
});
