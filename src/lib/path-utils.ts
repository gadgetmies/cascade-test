import * as path from 'path';

export function getDisplayTestFile(testFile: string, basePath?: string): string {
  try {
    let actualPath = testFile;
    if (testFile.startsWith('file://')) {
      actualPath = testFile.replace('file://', '');
    }

    const relativeBase = basePath || process.cwd();
    return path.relative(relativeBase, actualPath);
  } catch {
    return testFile;
  }
}

/**
 * Validates if a target path is a safe subdirectory of a base directory.
 * Prevents path traversal vulnerabilities.
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, targetPath);

  const relative = path.relative(resolvedBase, resolvedTarget);

  // If the relative path starts with '..', it's outside the base directory.
  // If it's absolute (which path.relative shouldn't return unless on different drives on Windows), it's also outside.
  // Empty string means it's the base directory itself, which is blocked to prevent dangerous cleanup operations like rmSync(CWD).
  return (
    relative !== '' &&
    relative !== '..' &&
    !relative.startsWith('..' + path.sep) &&
    !path.isAbsolute(relative)
  );
}
