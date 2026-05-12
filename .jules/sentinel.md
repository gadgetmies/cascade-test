## 2026-05-12 - Path Traversal and Arbitrary Directory Deletion in CLI
**Vulnerability:** The CLI options `--coverage-dir` and `--output` accepted arbitrary paths, allowing the test runner to delete directories (via `rmSync`) or write files anywhere the user had permissions, including the CWD or system directories.
**Learning:** Tools that perform cleanup (like `rmSync`) are highly dangerous when target paths are user-controlled and not strictly validated against a safe base directory. `path.resolve` alone does not prevent traversal.
**Prevention:** Implement a robust `isPathSafe` utility using `path.relative` to ensure the target is a subdirectory of a safe base (e.g., CWD) and specifically block the base directory itself to prevent accidental self-deletion.
