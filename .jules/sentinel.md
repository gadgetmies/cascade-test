# Sentinel Journal 🛡️

## 2025-05-15 - Path Traversal in Fixture Utilities
**Vulnerability:** The `fixture-utils.ts` module allowed arbitrary file read/write via path traversal in `fixtureName`.
**Learning:** Joining paths without validating that the result is within the intended directory can lead to path traversal even if the base directory is trusted.
**Prevention:** Use `path.relative()` to verify that the resolved path does not start with `..` and is not absolute.
