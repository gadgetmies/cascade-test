# Sentinel Journal - Security Learnings

## 2024-12-26 - Path Traversal in Fixture Loading
**Vulnerability:** The `readFixture` and `createFixture` functions in `fixture-utils.ts` allowed access to files outside the intended fixtures directory by using `..` in the fixture name.
**Learning:** Joining paths with `path.join` does not prevent traversing above the base directory. Validation using `path.relative` is necessary to ensure the resolved path stays within the boundaries.
**Prevention:** Always validate resolved paths against a base directory using `path.relative(base, resolved)` and checking if the result starts with `..`.

## 2024-12-26 - Insecure Temporary Files and Race Conditions
**Vulnerability:** Test results were communicated via a fixed-name temporary file (`.cascade-test-results.json`) in the current working directory. This created race conditions for parallel runs and was susceptible to symlink attacks.
**Learning:** Using predictable filenames in potentially shared or project directories is a security risk and affects reliability.
**Prevention:** Use unique filenames generated with `crypto.randomBytes` in the system's temporary directory (`os.tmpdir()`). Pass the specific path to child processes via environment variables to ensure they use the correct, unique file.
