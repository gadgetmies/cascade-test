## 2026-02-22 - [Path Traversal in Fixture Utilities]
**Vulnerability:** The `fixture-utils.ts` allowed writing files anywhere on the filesystem by providing a `fixtureName` with directory traversal sequences (e.g., `../../file.txt`).
**Learning:** Joining paths without validation is dangerous when one of the components can be influenced by input, even if that input is typically controlled by developers (as it might be influenced by other vulnerabilities or misconfigurations).
**Prevention:** Always resolve the final path and verify that it remains within the intended base directory using `path.relative` or similar checks.
