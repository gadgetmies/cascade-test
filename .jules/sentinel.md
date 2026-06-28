## 2026-06-28 - [Path Traversal in CLI and Fixtures]
**Vulnerability:** The CLI runner and fixture utility were vulnerable to path traversal through user-controlled path arguments (--coverage-dir, --output) and fixture names.
**Learning:** Functions like `fs.rmSync` and `fs.writeFileSync` can be dangerous when given paths derived from user input or test configuration without validation. `path.resolve` alone does not prevent directory traversal.
**Prevention:** Always validate paths using `path.relative` against a trusted base directory (like CWD) to ensure they remain within expected boundaries. Disallowing the base directory itself (CWD) can also prevent accidental destructive operations on the project root.
