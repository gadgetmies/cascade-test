import { test } from "../../index.js";
import { spawnSync } from "child_process";

const run = (args: string[]) => spawnSync("node", ["dist/bin/run-tests.js", "src/test/integration", "--glob", "timeout.test.ts", ...args], { encoding: "utf8" });

export default test({
  "Security": {
    "block traversal": () => {
      if (!run(["--coverage", "--coverage-dir", "../d"]).stderr.includes("Security Error: Coverage directory")) return "Failed coverage-dir check";
      if (!run(["--reporter", "json", "--output", "../r.json"]).stderr.includes("Security Error: Output path")) return "Failed output check";
      if (!run(["--coverage", "--coverage-dir", "."]).stderr.includes("Security Error: Cannot use current working directory")) return "Failed CWD check";
    }
  }
});
