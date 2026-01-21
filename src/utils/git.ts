import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export class GitUtils {
  getBranch(currentDir: string): string | null {
    const gitHeadPath = path.join(currentDir, ".git", "HEAD");
    try {
      const content = fs.readFileSync(gitHeadPath, "utf-8").trim();
      const match = content.match(/ref: refs\/heads\/(.+)/);
      return match && match[1] ? match[1] : null;
    } catch {
      return null;
    }
  }

  getStatus(currentDir: string): string {
    try {
      const commandOutput = execSync("git status --porcelain", {
        cwd: currentDir,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();
      return commandOutput ? " *" : "";
    } catch {
      return "";
    }
  }

  isGitRepository(currentDir: string): boolean {
    try {
      const gitPath = path.join(currentDir, ".git");
      return fs.existsSync(gitPath);
    } catch {
      return false;
    }
  }
}
