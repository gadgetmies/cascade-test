## 2026-05-16 - Path Traversal Prevention in CLI Arguments
**Vulnerability:** The CLI runner accepted arbitrary paths for `--coverage-dir` and `--output`, which could lead to arbitrary file creation or directory deletion (via `fs.rmSync` on the coverage directory) outside the project scope.
**Learning:** `path.resolve` alone does not prevent directory traversal. Validation using `path.relative` against a base directory (like CWD) is necessary to ensure paths stay within intended boundaries.
**Prevention:** Use the `isPathSafe` utility to validate user-provided paths. The pattern `relative === ".." || relative.startsWith(".." + path.sep) || path.isAbsolute(relative) || relative === ""` effectively blocks traversal and prevents operations on the base directory itself.
