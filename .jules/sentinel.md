## 2026-07-15 - CLI Path Traversal and Directory Deletion Prevention
**Vulnerability:** The test runner CLI accepted user-supplied output path and coverage directory arguments without validation, leading to path traversal vulnerability and risk of recursive deletion of directories (including the CWD) outside the project directory.
**Learning:** Implicit normalization functions like `path.resolve` or `path.join` do not prevent target paths from traversing up using `..` sequences. Manual validation is needed using `path.relative` to ensure the target resides within a safe boundary.
**Prevention:** Implement `isPathSafe` using `path.relative(baseDir, targetDir)` and verify that the relative path is neither absolute nor starts with `..`.
