## 2026-07-03 - [Path Traversal in CLI and Fixtures]
**Vulnerability:** Path traversal via `--coverage-dir` and `--output` CLI arguments, and via `fixtureName` in fixture utilities. The code was performing `fs.rmSync` and `fs.mkdirSync` on user-provided paths without validation.
**Learning:** `path.resolve` and `path.join` do not prevent directory traversal. Validation using `path.relative` to ensure the resolved path remains within the intended base directory is necessary.
**Prevention:** Implement a central `isPathSafe` utility that uses `path.relative` to verify that a target path is contained within a base directory and does not resolve to the base directory itself.
