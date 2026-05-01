## 2026-04-24 - Arbitrary Directory Deletion and File Write via Path Traversal
**Vulnerability:** The `--coverage-dir` option allowed arbitrary directory deletion (via `fs.rmSync(config.coverage.directory, { recursive: true })`) and the `--output` option allowed arbitrary file writes.
**Learning:** Providing CLI options that accept file paths without validation can lead to severe security risks, especially when those paths are used in destructive operations or for writing data.
**Prevention:** Always validate user-provided paths against a safe boundary (like the current working directory) before performing file system operations. The `path.relative` check ensuring the path does not start with `..` and is not absolute (or is a subdirectory) is a robust pattern for this.

## 2026-04-24 - Path Safety vs. System Temporary Directories
**Challenge:** Strict path validation (blocking anything outside CWD) broke existing integration tests that used `os.tmpdir()` for temporary output files.
**Learning:** Security controls must be balanced with legitimate system needs. In this framework, we decided to enforce CWD boundary strictly, requiring tests to be updated to use CWD-relative paths for temporary artifacts.
**Prevention:** When implementing strict path boundaries, audit existing codebase for usage of `os.tmpdir()` or other absolute paths that might be intentionally used and update them to comply with the new security policy.
