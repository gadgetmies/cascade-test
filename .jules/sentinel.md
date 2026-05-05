## 2026-05-03 - Path Traversal and Arbitrary Directory Deletion via Coverage Directory
**Vulnerability:** The `--coverage-dir` option in the CLI allowed specifying any path, which was then passed to `fs.rmSync(dir, { recursive: true, force: true })`. This enabled arbitrary directory deletion (e.g., `--coverage-dir /etc` or `--coverage-dir .`).
**Learning:** Tools that perform cleanup or write operations based on user-provided paths are dangerous if those paths are not validated against a base directory. `path.resolve` alone does not prevent directory traversal.
**Prevention:** Use a path validation utility like `isPathSafe` that uses `path.relative` to ensure the resolved path is a subdirectory of the intended base directory (and not the base directory itself).
