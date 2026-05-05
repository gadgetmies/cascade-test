import { test } from "../../index.js";
import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../..");

test({
  "Security: Path Validation": {
    "should block coverage directory outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--coverage",
        "--coverage-dir",
        "/tmp/malicious-coverage"
      ], {
        cwd: rootDir,
        encoding: "utf8"
      });

      if (!result.stderr.includes("Security Error: Coverage directory '/tmp/malicious-coverage' is outside the current working directory or points to it.")) {
        return `Expected security error in stderr, but got:\n${result.stderr}`;
      }

      if (result.status !== 1) {
        return `Expected exit code 1, but got ${result.status}`;
      }
    },

    "should block coverage directory pointing to CWD": () => {
        const result = spawnSync("npx", [
          "tsx",
          "src/bin/run-tests.ts",
          "src/test/integration",
          "--coverage",
          "--coverage-dir",
          "."
        ], {
          cwd: rootDir,
          encoding: "utf8"
        });

        if (!result.stderr.includes("Security Error: Coverage directory '.' is outside the current working directory or points to it.")) {
          return `Expected security error in stderr, but got:\n${result.stderr}`;
        }

        if (result.status !== 1) {
          return `Expected exit code 1, but got ${result.status}`;
        }
      },

    "should block output file outside CWD": () => {
      const result = spawnSync("npx", [
        "tsx",
        "src/bin/run-tests.ts",
        "src/test/integration",
        "--reporter",
        "json",
        "--output",
        "../malicious-output.json"
      ], {
        cwd: rootDir,
        encoding: "utf8"
      });

      if (!result.stderr.includes("Security Error: Output file '../malicious-output.json' is outside the current working directory or points to it.")) {
        return `Expected security error in stderr, but got:\n${result.stderr}`;
      }

      if (result.status !== 1) {
        return `Expected exit code 1, but got ${result.status}`;
      }
    }
  }
});
