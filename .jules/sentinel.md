## 2025-10-01 - Path Traversal in Fixture Utilities
**Vulnerability:** Path traversal in `getFixturePath` allowed reading and writing files outside the intended `fixtures/` directory by using `..` in the fixture name.
**Learning:** Concatenating paths with `path.join` without validating the resolved path against the base directory is insufficient for security.
**Prevention:** Always use `path.resolve` followed by `path.relative` to ensure the resolved path is still within the expected parent directory.
