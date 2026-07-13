## 2026-07-13 - [Path Traversal in Fixture and CLI Utilities]
**Vulnerability:** Path traversal via `fixtureName` in `assertFixture` and via `--output`/`--coverage-dir` in CLI.
**Learning:** `path.join` and `path.resolve` alone do not prevent directory traversal if the input contains `..` segments. Explicit validation using `path.relative` is necessary to ensure the resolved path remains within the intended base directory.
**Prevention:** Use a dedicated utility like `isPathSafe` to validate all user-provided paths against a trusted base directory before performing file system operations.
