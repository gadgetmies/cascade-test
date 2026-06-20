# Sentinel Journal

## 2026-06-20 - [Path Traversal & Safe Directory Validation]
**Vulnerability:** Command-line arguments (`--coverage-dir`, `--output`) and fixture names were susceptible to path traversal attacks, allowing operations outside the project's root directory. Specifically, `--coverage-dir` was dangerous because the framework performs `fs.rmSync(dir, { recursive: true })` on it.
**Learning:** `path.resolve` and `path.join` do not inherently prevent traversal if the input contains `..`. Furthermore, using the Current Working Directory (CWD) as a target for recursive deletion is a high-risk operation that needs explicit guarding.
**Prevention:** Implement a robust `isPathSafe` utility that resolves the target relative to a trusted base and verifies the resulting relative path does not start with `..`. Always add a specific guard when a directory is subject to recursive deletion.
