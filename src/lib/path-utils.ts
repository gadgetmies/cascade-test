import * as path from 'path';

/**
 * Checks if a path is safe to use (i.e., it's a subdirectory of the base directory
 * and not the base directory itself).
 *
 * @param targetPath The path to validate
 * @param baseDir The base directory (defaults to process.cwd())
 * @returns true if the path is safe, false otherwise
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(targetPath);

    const relative = path.relative(resolvedBase, resolvedPath);

    // Path is outside baseDir if it starts with '..'
    if (relative === '..' || relative.startsWith('..' + path.sep)) {
      return false;
    }

    // Path is absolute if it doesn't start with '..' but is still absolute (e.g. different drive on Windows)
    if (path.isAbsolute(relative)) {
      return false;
    }

    // Block the base directory itself for safety (e.g. don't delete CWD)
    if (relative === '') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

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
