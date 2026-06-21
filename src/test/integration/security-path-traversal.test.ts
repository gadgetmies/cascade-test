import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const run = (args: string[]) => spawnSync(
  process.execPath,
  ["--import", "tsx", "src/bin/run-tests.ts", "src/test/integration", "--glob", "timeout.test.ts", ...args],
  { cwd: projectRoot, encoding: "utf8" }
);

export default test({
  "Security": {
    setup: () => ({ timeout: 60000 }),
    "block traversal": () => {
      const r1 = run(["--coverage", "--coverage-dir", "../d"]);
      if (!r1.stderr.includes("Security Error: Coverage directory")) {
        return `Failed coverage-dir check. Status: ${r1.status}. Stderr: ${r1.stderr}`;
      }
      const r2 = run(["--reporter", "json", "--output", "../r.json"]);
      if (!r2.stderr.includes("Security Error: Output path")) {
        return `Failed output check. Status: ${r2.status}. Stderr: ${r2.stderr}`;
      }
      const r3 = run(["--coverage", "--coverage-dir", "."]);
      if (!r3.stderr.includes("Security Error: Cannot use current working directory")) {
        return `Failed CWD check. Status: ${r3.status}. Stderr: ${r3.stderr}`;
      }
    }
  }
});
