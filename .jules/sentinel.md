## 2025-05-15 - Path Traversal in Fixture Utilities
**Vulnerability:** The `fixture-utils` allowed reading and writing files outside the intended `fixtures` directory by using `..` in the `fixtureName` parameter.
**Learning:** `path.join` does not prevent path traversal if one of the components contains `..`.
**Prevention:** Always use `path.resolve` followed by a check against the base directory using `path.relative` to ensure the resolved path is within the expected boundaries.
