import * as path from "path";

export class PathUtils {
  formatDir(dir: string, homeDir: string): string {
    return dir.startsWith(homeDir) ? dir.replace(homeDir, "~") : dir;
  }

  getHomeDir(): string {
    return process.env.HOME || process.env.USERPROFILE || "";
  }

  resolvePath(currentDir: string, targetPath: string): string {
    if (targetPath.startsWith("~")) {
      return path.resolve(this.getHomeDir(), targetPath.slice(1));
    }
    return path.resolve(currentDir, targetPath);
  }

  isAbsolutePath(filePath: string): boolean {
    return path.isAbsolute(filePath);
  }
}
