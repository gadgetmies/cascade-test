## 2026-05-11 - Path Traversal in CLI and Fixture Utilities
**Vulnerability:** The `--coverage-dir` and `--output` CLI options, as well as fixture names in `assertFixture`, allowed arbitrary path traversal. Specifically, `--coverage-dir` performed a recursive `rmSync` on the provided path, enabling arbitrary directory deletion.
**Learning:** `path.join` and `path.resolve` do not prevent directory traversal. Utilities that perform cleanup or write files based on user-provided paths are particularly dangerous.
**Prevention:** Always validate that user-provided paths are safe subdirectories of an intended base directory. Use `path.relative(baseDir, resolvedPath)` and check if the result is empty, starts with `..`, or is absolute.
