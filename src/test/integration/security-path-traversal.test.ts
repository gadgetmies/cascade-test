import { test } from "../../index.js";
import { spawn } from "child_process";

test({
  "Security Path Traversal": {
    setup: () => ({ timeout: 30000 }),

    "should block unsafe coverage directory": () => new Promise((resolve) => {
      const child = spawn("npx", ["tsx", "src/bin/run-tests.ts", "src/test/integration", "--regex", "framework", "--coverage", "--coverage-dir", "../unsafe_coverage"]);
      let output = "";
      child.stderr.on("data", (d) => output += d.toString());
      child.on("exit", (code) => code === 1 && output.includes("Security Error: Coverage directory '../unsafe_coverage'") ? resolve() : resolve(`Code: ${code}, Output: ${output}`));
    }),

    "should block unsafe output file": () => new Promise((resolve) => {
      const child = spawn("npx", ["tsx", "src/bin/run-tests.ts", "src/test/integration", "--regex", "framework", "--reporter", "json", "--output", "../unsafe_output.json"]);
      let output = "";
      child.stderr.on("data", (d) => output += d.toString());
      child.on("exit", (code) => code === 1 && output.includes("Security Error: Output file '../unsafe_output.json'") ? resolve() : resolve(`Code: ${code}, Output: ${output}`));
    })
  }
});
