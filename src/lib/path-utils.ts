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
 * Ensures a path is safe to use (not outside base directory and not the base directory itself)
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const resolvedPath = path.resolve(baseDir, targetPath);
    const relative = path.relative(baseDir, resolvedPath);

    // Check if it's outside the base directory
    const isOutside =
      relative.startsWith(".." + path.sep) ||
      relative === ".." ||
      path.isAbsolute(relative);
    if (isOutside) return false;

    // Check if it's the base directory itself (to prevent accidental deletion of CWD)
    if (relative === "") return false;

    return true;
  } catch {
    return false;
  }
}
