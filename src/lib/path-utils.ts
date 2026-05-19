import * as path from 'path';

export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const rel = path.relative(path.resolve(baseDir), path.resolve(targetPath));
    return !(rel === '' || rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel));
  } catch { return false; }
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
