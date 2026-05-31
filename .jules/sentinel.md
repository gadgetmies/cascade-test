## 2026-05-26 - [CRITICAL] Path Traversal in CLI and Fixtures
**Vulnerability:** The CLI runner accepted arbitrary paths for `--coverage-dir` and `--output`, performing `rmSync` on the coverage directory. Additionally, `assertFixture` allowed reading/writing files outside the fixtures directory via `fixtureName`.
**Learning:** `path.resolve` and `path.join` do not prevent directory traversal if the resulting path is not validated against a base directory. `fs.rmSync` with user-controlled paths is extremely dangerous.
**Prevention:** Always validate resolved paths using `path.relative` to ensure they stay within an intended base directory and are not equal to the base directory itself.
