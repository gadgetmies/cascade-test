## 2025-05-14 - Path Traversal in --coverage-dir
**Vulnerability:** Arbitrary directory deletion via the `--coverage-dir` CLI parameter. The test runner used `fs.rmSync` on the provided path without validation.
**Learning:** CLI parameters that interact with the filesystem must be validated to ensure they stay within expected boundaries, especially when performing destructive operations like deletion.
**Prevention:** Use `path.relative` to verify that a target directory is a subdirectory of the current working directory and not the CWD itself.
