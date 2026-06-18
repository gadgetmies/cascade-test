import * as path from 'path';

/**
 * Check if a path is safe to use (not escaping the base directory)
 * @param targetPath The path to check
 * @param baseDir The base directory that should contain the target path
 * @returns true if the path is safe
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedPath = path.resolve(baseDir, targetPath);
    const relative = path.relative(baseDir, resolvedPath);
    // Path is safe if it's inside baseDir (doesn't start with ..) and is not an absolute path
    // We also allow the base directory itself (relative === "")
    return (relative === "" || !relative.startsWith('..')) && !path.isAbsolute(relative);
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
