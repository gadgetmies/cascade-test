## 2025-05-22 - Path Traversal in Fixture Utilities
**Vulnerability:** Path traversal in fixture utilities via the fixtureName parameter allowed access to files outside the fixtures directory.
**Learning:** Joining paths with user-provided strings without validation is dangerous.
**Prevention:** Resolve the path and use path.relative to verify it remains within the base directory.
