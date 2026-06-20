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
 * Prevents path traversal vulnerabilities by ensuring the resolved path
 * is within the base directory.
 *
 * @param baseDir - The trusted base directory (must be absolute)
 * @param targetPath - The path to validate (can be relative or absolute)
 * @returns boolean - true if the path is safe, false otherwise
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, targetPath);

  const relative = path.relative(resolvedBase, resolvedTarget);

  // path.relative returns '' if they are the same
  // On Windows, it might use backslashes, so we check for both
  return (relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..')) && !path.isAbsolute(relative);
}
