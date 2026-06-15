import { test } from "../../index.js";
import { spawnSync } from "child_process";
import { expect } from "chai";
test({
  setup: () => ({ timeout: 60000 }),
  "Path Traversal Security": () => {
    const run = (args: string[]) => spawnSync("npx", ["tsx", "src/bin/run-tests.ts", "src/test/integration", ...args]).stderr.toString();
    expect(run(["--output=../o.json"])).to.include("Security Error");
    expect(run(["--coverage", "--coverage-dir=../c"])).to.include("Security Error");
    expect(run(["--coverage", "--coverage-dir=."])).to.include("Security Error");
  }
});
