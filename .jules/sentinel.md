## 2026-04-11 - Path Traversal in Fixture Utilities
**Vulnerability:** Functions that construct file paths using `path.join` on user-controlled input (like `fixtureName`) allowed accessing or creating files outside the intended directory.
**Learning:** `path.join` and `path.resolve` do not prevent directory traversal (e.g., using `../`). Validation must be performed after resolution.
**Prevention:** Use `path.relative(baseDir, resolvedPath)` and check if the result starts with `..` or is an absolute path to ensure the resolved path remains within `baseDir`.
