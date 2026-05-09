import { test } from "../../index.js";
import { spawn } from "child_process";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../../");
const cliPath = path.resolve(rootDir, "src/bin/run-tests.ts");

async function runCli(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["tsx", cliPath, ...args], {
      cwd: rootDir,
      env: { ...process.env, NODE_ENV: "test" }
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("exit", (code) => {
      resolve({ code: code || 0, stdout, stderr });
    });
  });
}

test({
  setup: () => ({ timeout: 60000 }),
  "should block coverage directory outside CWD": async (context: any) => {
    const result = await runCli(["src/test/examples", "--coverage", "--coverage-dir", "/tmp/unsafe-coverage"]);
    if (!result.stderr.includes("Security Error")) {
      return "Expected security error for coverage directory outside CWD, but it was not found";
    }
    if (result.code === 0) {
      return "Expected non-zero exit code for security error";
    }
  },

  "should block coverage directory pointing to CWD": async (context: any) => {
    const result = await runCli(["src/test/examples", "--coverage", "--coverage-dir", "."]);
    if (!result.stderr.includes("Security Error")) {
      return "Expected security error for coverage directory pointing to CWD, but it was not found";
    }
    if (result.code === 0) {
      return "Expected non-zero exit code for security error";
    }
  },

  "should allow safe coverage directory within CWD": async (context: any) => {
    const result = await runCli(["src/test/examples", "--coverage", "--coverage-dir", "safe-coverage", "--regex", "example.test.ts"]);
    if (result.stderr.includes("Security Error")) {
      return `Unexpected security error for safe coverage directory: ${result.stderr}`;
    }
  }
});
