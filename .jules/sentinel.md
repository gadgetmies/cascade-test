## 2026-04-11 - Path Validation and Directory Traversal
**Vulnerability:** Arbitrary directory deletion via CLI options and path traversal in fixture utilities.
**Learning:** `path.join` and `path.resolve` do not prevent directory traversal. `path.relative` must be used to validate that the resolved path is within the intended boundary. Specifically, the check `relativePath.startsWith('..')` is too aggressive as it blocks valid files starting with `..` (e.g., `..hidden.json`).
**Prevention:** Use the pattern `relativePath === '..' || relativePath.startsWith('..' + path.sep) || path.isAbsolute(relativePath)` to robustly detect traversal while allowing valid filenames starting with double dots. For coverage-style options that should not point to CWD itself, also check `relativePath === ''`.
