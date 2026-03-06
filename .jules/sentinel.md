## 2025-05-14 - Arbitrary Directory Deletion via Coverage Directory Option
**Vulnerability:** The test runner (`src/bin/run-tests.ts`) used `fs.rmSync` on the directory specified by the `--coverage-dir` flag without any validation. An attacker could provide a path like `/etc` or `/home/user` which would be recursively deleted if the process had sufficient permissions.

**Learning:** Destructive operations like `fs.rmSync` must always be preceded by strict path validation when the path is derived from user input or configuration. Trusting that the user will only provide safe paths is a security risk.

**Prevention:** Implement a check to ensure that the target directory for deletion is a subdirectory of the project root (or current working directory) and is not the root directory itself.
