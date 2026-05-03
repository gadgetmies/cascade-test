## 2026-05-03 - Path Traversal in CLI and Fixtures
**Vulnerability:** The test runner CLI (`--coverage-dir`, `--output`) and fixture utilities did not validate that provided paths remained within the current working directory or intended fixtures directory. This could allow an attacker to delete arbitrary directories (via coverage cleanup) or write files anywhere the process has permissions.
**Learning:** Functions like `path.join` and `path.resolve` do not prevent directory traversal (e.g., using `..`). `fs.rmSync(dir, { recursive: true })` is particularly dangerous when `dir` is user-controllable.
**Prevention:** Use `path.relative(base, target)` and verify the result:
1. Is not empty (it shouldn't be the base directory itself for certain operations).
2. Does not start with `..` (no traversal up).
3. Is not absolute (some OS-specific `path.relative` behaviors).
The utility `isPathSafe` now implements this pattern.
