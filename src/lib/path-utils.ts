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
 * Prevents directory traversal and ensures the path is not the base directory itself.
 *
 * @param targetPath - The path to validate
 * @param baseDir - The allowed base directory (defaults to process.cwd())
 * @returns boolean - True if the path is safe, false otherwise
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    if (!targetPath) return false;

    // Absolute paths are risky if they point outside baseDir
    // We resolve everything to absolute paths for comparison
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(targetPath);

    const relative = path.relative(resolvedBase, resolvedTarget);

    // Check if the path:
    // 1. Is empty (points to the base directory itself)
    // 2. Starts with '..' (traverses up from base directory)
    // 3. Is absolute (on some systems path.relative might return an absolute path if it's on a different drive)
    const isOutside = relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative);
    const isBaseDir = relative === '';

    return !isOutside && !isBaseDir;
  } catch {
    // If anything fails during resolution, assume it's unsafe
    return false;
  }
}
