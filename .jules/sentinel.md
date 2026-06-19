## 2026-06-19 - Path Traversal Protection for CLI and Fixtures
**Vulnerability:** The test runner allowed arbitrary file writing/deletion via `--coverage-dir` and `--output` arguments, and `fixture-utils` allowed accessing files outside the fixtures directory.
**Learning:** `path.resolve` and `path.join` do not prevent directory traversal. Validation using `path.relative(baseDir, resolvedPath)` and checking for '..' escape is necessary.
**Prevention:** Use a dedicated `isPathSafe` utility for all file operations that involve user-provided or caller-provided paths to ensure they stay within intended boundaries.
