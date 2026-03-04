## 2026-03-04 - [Directory Traversal and XML Injection]
**Vulnerability:** Arbitrary directory deletion via `--coverage-dir` and XML injection in `JUnitReporter`.
**Learning:** Destructive operations like `fs.rmSync` on user-provided paths must be strictly validated. XML reporters must escape all user-controlled data to prevent malformed output or injection.
**Prevention:** Validate that destructive paths are within expected boundaries using `path.relative`. Use a robust XML escaping utility for all dynamic content in reporters.
