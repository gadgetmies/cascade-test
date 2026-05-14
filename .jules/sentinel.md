## 2026-05-14 - Path Traversal in Coverage and Fixture Utilities
**Vulnerability:** Arbitrary directory deletion via `--coverage-dir` and path traversal in `assertFixture`.
**Learning:** CLI options that perform file system operations (like `fs.rmSync` or `fs.writeFileSync`) can be exploited to delete or overwrite arbitrary files if the path is not validated against a base directory. `path.resolve` and `path.join` alone do not prevent directory traversal.
**Prevention:** Use `path.relative` to verify that the resolved target path is a subdirectory of the expected base directory. Block paths that result in an empty string (CWD itself) or start with `..`.
