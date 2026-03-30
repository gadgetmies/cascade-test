export function forkExecArgvForScript(scriptPath: string): string[] {
  const normalized = scriptPath.replace(/\\/g, "/").toLowerCase();
  if (normalized.endsWith(".ts")) {
    return ["--import", "tsx"];
  }
  return [];
}
