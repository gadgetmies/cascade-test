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
 * Prevents path traversal and ensures the target is not the base directory itself.
 *
 * @param targetPath - The path to validate
 * @param baseDir - The base directory it should be under (defaults to process.cwd())
 * @returns true if the path is safe, false otherwise
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(targetPath);

    const relative = path.relative(resolvedBase, resolvedPath);

    // Check if it's outside baseDir, is baseDir itself, or is an absolute path
    // path.relative can return an absolute path if the paths are on different drives on Windows
    if (relative === '' ||
        relative === '..' ||
        relative.startsWith('..' + path.sep) ||
        path.isAbsolute(relative)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
