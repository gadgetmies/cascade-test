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
 * Checks if a target path is safe (i.e., within the base directory)
 * to prevent path traversal attacks.
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedPath = path.resolve(baseDir, targetPath);
    const relative = path.relative(baseDir, resolvedPath);
    // Path is safe if it doesn't start with '..' and is not absolute
    // (path.relative returns an absolute path if base and target are on different drives)
    return (relative === "" || !relative.startsWith("..")) && !path.isAbsolute(relative);
  } catch {
    return false;
  }
}
