## 2026-04-24 - Arbitrary Directory Deletion via --coverage-dir
**Vulnerability:** The `--coverage-dir` CLI option allowed users to specify any path, which was then passed to `fs.rmSync(path, { recursive: true, force: true })`. This could lead to arbitrary directory deletion if a user provided a path like `..` or `/`.
**Learning:** Using user-controlled input in file system operations that perform cleanup or deletion is extremely dangerous without strict path validation.
**Prevention:** Implement a robust path validation utility (`isPathSafe`) that uses `path.relative` to ensure target paths are restricted to safe subdirectories of the current working directory and are not the directory itself.
