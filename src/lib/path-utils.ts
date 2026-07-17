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

export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  if (typeof targetPath !== 'string') return false;
  // Security: Validate path to prevent traversal attacks
  const resolved = path.resolve(baseDir, targetPath);
  const rel = path.relative(baseDir, resolved);
  return !path.isAbsolute(rel) && !rel.startsWith('..' + path.sep) && rel !== '..';
}
