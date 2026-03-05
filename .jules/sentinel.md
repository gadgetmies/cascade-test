## 2025-10-01 - [XML Injection in Reporters]
**Vulnerability:** JUnit XML reporter did not escape test names, suite names, or error messages, allowing arbitrary XML injection. TAP reporter was also vulnerable to malformed output if test names contained newlines.
**Learning:** Even internal tool output (like test reports) must be treated as a trust boundary, especially when consumed by other CI/CD systems (Jenkins, Azure DevOps).
**Prevention:** Always use escaping utilities for dynamic content in structured output formats. Use robust TAP formatting (indented blocks) for multiline messages.

## 2025-10-01 - [Path Traversal in Fixture Utilities]
**Vulnerability:** `assertFixture` and `createFixture` allowed arbitrary file reads/writes by passing `..` in the fixture name, as paths were joined without validation.
**Learning:** File system utilities that take a user-provided string (even a test name) and join it with a base directory are vulnerable to path traversal unless the result is validated.
**Prevention:** Use `path.relative(base, resolved)` and verify the result doesn't start with `..` to ensure the final path is contained within the intended base directory.

## 2025-10-01 - [Intentional Failure Verification Pattern]
**Vulnerability:** Testing security mitigations often requires generating "failed" states (e.g., malformed input that triggers an error). If these are added to the main integration suite, they cause CI to fail globally.
**Learning:** Security tests that rely on intentional failures should be implemented as examples that are executed by a separate integration test. This allows verifying the reporter's output (escaping, formatting) without breaking the test runner's exit code.
**Prevention:** Move "expected to fail" security tests to `src/test/examples` and use `runTestFile` within an integration test to assert on the captured `reporterOutput`.
