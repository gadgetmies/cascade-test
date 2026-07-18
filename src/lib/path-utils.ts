import * as path from 'path';

export function isPathSafe(targetPath: unknown, baseDir: string = process.cwd()): boolean {
  if (typeof targetPath !== 'string') return false;
  const rel = path.relative(path.resolve(baseDir), path.resolve(baseDir, targetPath));
  return !path.isAbsolute(rel) && !rel.startsWith('..' + path.sep) && rel !== '..';
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
