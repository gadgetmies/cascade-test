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
 * Validates if a target path is safely contained within a base directory.
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const rel = path.relative(path.resolve(baseDir), path.resolve(baseDir, targetPath));
    return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
  } catch { return false; }
}
