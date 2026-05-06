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
 * Checks if a target path is a safe subdirectory of a base directory.
 * Prevents directory traversal and operations on the base directory itself.
 *
 * @param targetPath The path to validate
 * @param baseDir The base directory (defaults to process.cwd())
 * @returns true if the path is a safe subdirectory
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(targetPath);

    const relative = path.relative(resolvedBase, resolvedPath);

    // Check if the path is outside the base directory or is the base directory itself
    // Empty string means the paths are identical (target === base)
    // '..' means it's the parent
    // startsWith('..' + path.sep) means it's in a different branch
    // path.isAbsolute(relative) can happen on Windows with different drives
    if (relative === '' || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
      return false;
    }

    return true;
  } catch {
    // If anything fails (e.g. invalid paths), assume unsafe
    return false;
  }
}
