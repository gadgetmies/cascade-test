## 2026-05-18 - Path Traversal Prevention in CLI and Fixtures

**Vulnerability:** CLI options like `--coverage-dir` and `--output` as well as `fixture-utils` methods were susceptible to path traversal attacks, allowing arbitrary file read/write/delete outside the intended directories.

**Learning:** `path.resolve` and `path.join` do not prevent escaping the base directory if the input contains `..`. Simple checks for `..` in the input are also insufficient as they can be bypassed by absolute paths or other encoding.

**Prevention:** Use `path.relative(base, resolvedTarget)` and check if the result starts with `..` or is absolute to ensure the target is within the base directory. Additionally, for CLI options, ensuring the relative path is not empty (`''`) prevents operations on the root directory itself.
