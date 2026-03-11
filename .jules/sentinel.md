## 2025-10-01 - Path Traversal in Fixture Utilities
**Vulnerability:** The `assertFixture` and `readFixture` functions in `src/lib/fixture-utils.ts` were vulnerable to path traversal because they used `path.join` with unsanitized user-provided fixture names.
**Learning:** Even internal utility functions used in tests can be vectors for path traversal if they interact with the file system based on input that can be manipulated (e.g., in a compromised test environment or malicious PR).
**Prevention:** Always validate that resolved file paths remain within their intended directories using `path.relative` and checking for `..` or absolute paths.
