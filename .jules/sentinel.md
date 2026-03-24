## 2026-03-15 - Path Traversal in Fixture Utilities
**Vulnerability:** The `fixture-utils.ts` module allowed reading and writing files outside the intended `fixtures` directory by using relative path segments (e.g., `../../../`) or absolute paths in the `fixtureName` argument.
**Learning:** Functions that join user-provided (or even developer-provided) path segments with a base directory must always validate that the resulting path remains within the expected boundaries using `path.relative` and checking for leading `..` or absolute paths.
**Prevention:** Always use `path.resolve` or `path.join` followed by a check to ensure the resolved path starts with the base directory's path. Explicitly block absolute paths if they are not intended to be supported.
