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
 * Prevents directory traversal and accidental operations on the root.
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(baseDir, targetPath);
    const relative = path.relative(resolvedBase, resolvedTarget);

    // Path is unsafe if:
    // 1. It is outside the base directory (starts with ..)
    // 2. It is absolute (path.relative might return absolute on different drives on Windows, though less likely here)
    // 3. It is empty or just '.' (points to the base directory itself)
    return (
      relative !== '' &&
      relative !== '..' &&
      !relative.startsWith('..' + path.sep) &&
      !path.isAbsolute(relative)
    );
  } catch {
    return false;
  }
}
