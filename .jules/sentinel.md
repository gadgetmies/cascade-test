## 2026-04-01 - Path Traversal in Fixture Resolution
**Vulnerability:** The `assertFixture` and related utilities in `fixture-utils.ts` allowed reading and writing files outside the intended `fixtures/` directory by using `..` sequences or absolute paths in the `fixtureName` parameter.
**Learning:** `path.join` on its own does not prevent directory traversal if one of the components contains `..`. Validation using `path.relative` to ensure the resolved path remains within a base directory is a necessary secondary check.
**Prevention:** Always validate that resolved file paths are contained within the expected parent directory. Reject absolute paths if only relative paths within a specific subtree are expected.
