export class PathUtils {
  getHomeDir(): string {
    return process.env.HOME || process.env.USERPROFILE || ".";
  }

  formatDir(currentDir: string, homeDir: string): string {
    if (currentDir.startsWith(homeDir)) {
      return "~" + currentDir.slice(homeDir.length);
    }
    return currentDir;
  }
}
