## 2026-07-09 - Path Traversal Prevention
**Vulnerability:** User-controlled input in CLI arguments (`--output`, `--coverage-dir`) and library functions (`assertFixture`) allowed writing files or reading fixtures outside the intended directories using `..` segments.
**Learning:** Standard path joining utilities like `path.join` and `path.resolve` do not implicitly prevent directory traversal. Explicit validation using `path.relative` is necessary to ensure the resolved path remains within the expected base directory.
**Prevention:** Use a centralized `isPathSafe` utility that resolves the target path, calculates its relative path from the base directory, and verifies it doesn't start with `..`.
