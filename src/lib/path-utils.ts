import * as path from 'path';

/**
 * Clean up test file path for display - make it relative to base path and drop file extension
 */
export function getDisplayTestFile(testFile: string, basePath?: string): string {
  try {
    // Handle file:// URLs by extracting the actual file path
    let actualPath = testFile;
    if (testFile.startsWith('file://')) {
      actualPath = testFile.replace('file://', '');
    }
    
    // Get relative path from base path (defaults to current working directory)
    const relativeBase = basePath || process.cwd();
    const relativePath = path.relative(relativeBase, actualPath);
    
    // Drop the file extension
    const pathWithoutExt = path.join(path.dirname(relativePath), path.basename(relativePath, path.extname(relativePath)));
    
    return pathWithoutExt;
  } catch {
    // If conversion fails, return the original path
    return testFile;
  }
}
