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
 * Checks if a target path is safe and stays within a base directory.
 * Prevents directory traversal attacks.
 *
 * @param baseDir - The directory that targetPath should be restricted to
 * @param targetPath - The path to check
 * @returns boolean - True if the path is safe, false otherwise
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(baseDir, targetPath);
    const rel = path.relative(resolvedBase, resolvedTarget);

    // Security: Ensure path does not traverse outside baseDir
    return !rel.startsWith('..' + path.sep) && rel !== '..';
  } catch {
    return false;
  }
}
