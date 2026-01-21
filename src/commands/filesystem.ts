import * as fs from "fs/promises";
import * as path from "path";
import type { Command, CommandContext } from "../types";

export class FilesystemCommands {
  getCommands(): Command[] {
    return [
      { name: "ls", description: "List files in current directory", usage: "ls", handler: this.lsCommand.bind(this) },
      { name: "cd", description: "Change directory", usage: "cd <directory>", handler: this.cdCommand.bind(this) },
      { name: "mkdir", description: "Create a directory", usage: "mkdir <name>", handler: this.mkdirCommand.bind(this) },
      { name: "touch", description: "Create an empty file", usage: "touch <filename>", handler: this.touchCommand.bind(this) },
      { name: "rm", description: "Remove a file or directory", usage: "rm <file> or rm -rf <dir>", handler: this.rmCommand.bind(this) },
      { name: "rmdir", description: "Remove an empty directory", usage: "rmdir <name>", handler: this.rmdirCommand.bind(this) },
      { name: "mv", description: "Move or rename a file/directory", usage: "mv <source> <destination>", handler: this.mvCommand.bind(this) },
      { name: "cat", description: "Display file contents", usage: "cat <filename>", handler: this.catCommand.bind(this) }
    ];
  }

  private async lsCommand(args: string[], context: CommandContext): Promise<void> {
    try {
      const items = await fs.readdir(context.currentDir, { withFileTypes: true });
      if (items.length === 0) {
        console.log("(empty directory)");
        return;
      }
      
      const sorted = items.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });
      
      const formatted = sorted.map((item) => {
        const isDir = item.isDirectory();
        const name = isDir ? `${item.name}/` : item.name;
        return {
          name,
          display: isDir ? `\x1b[1;34m${name}\x1b[0m` : name,
          length: name.length
        };
      });
      
      const termWidth = process.stdout.columns || 80;
      const maxLen = Math.max(...formatted.map(f => f.length)) + 2;
      const cols = Math.max(1, Math.floor(termWidth / maxLen));
      
      for (let i = 0; i < formatted.length; i += cols) {
        const row = formatted.slice(i, i + cols);
        const line = row.map(f => f.display.padEnd(maxLen + (f.display.length - f.length))).join('');
        console.log(line);
      }
    } catch (err: any) {
      console.log("Error reading directory:", err.message);
    }
  }

  private async cdCommand(args: string[], context: CommandContext): Promise<void> {
    let dirToChange = args[0];
    if (!dirToChange) {
      dirToChange = context.homeDir || ".";
    } else if (dirToChange === "~") {
      dirToChange = context.homeDir || ".";
    }

    const newPath = path.resolve(context.currentDir, dirToChange);
    try {
      const stat = await fs.stat(newPath);
      if (stat.isDirectory()) {
        context.currentDir = newPath;
        process.chdir(newPath);
      } else {
        console.log(`cd: Not a directory: ${args[0]}`);
      }
    } catch (err: any) {
      if (err.code === "ENOENT") {
        console.log(`cd: No such file or directory: ${args[0]}`);
      } else {
        console.log("cd Error:", err.message);
      }
    }
  }

  private async mkdirCommand(args: string[], context: CommandContext): Promise<void> {
    if (!args[0]) {
      console.log("Usage: mkdir <dir-name>");
      return;
    }
    
    try {
      await fs.mkdir(path.join(context.currentDir, args[0]));
      console.log(`Created directory: ${args[0]}`);
    } catch (err: any) {
      console.log("Error:", err.message);
    }
  }

  private async touchCommand(args: string[], context: CommandContext): Promise<void> {
    if (!args[0]) {
      console.log("Usage: touch <file-name>");
      return;
    }
    
    try {
      await fs.writeFile(path.join(context.currentDir, args[0]), "");
      console.log(`Created file: ${args[0]}`);
    } catch (err: any) {
      console.log("Error:", err.message);
    }
  }

  private async rmCommand(args: string[], context: CommandContext): Promise<void> {
    if (!args[0]) {
      console.log("Usage: rm <file> or rm -rf <dir>");
      return;
    }
    
    let recursive = false;
    let force = false;
    let target = "";
    
    for (const arg of args) {
      if (arg === "-rf" || arg === "-fr") {
        recursive = true;
        force = true;
      } else if (arg === "-r" || arg === "-R" || arg === "--recursive") {
        recursive = true;
      } else if (arg === "-f" || arg === "--force") {
        force = true;
      } else if (!arg.startsWith("-")) {
        target = arg;
      }
    }
    
    if (!target) {
      console.log("Usage: rm <file> or rm -rf <dir>");
      return;
    }
    
    const targetPath = path.join(context.currentDir, target);
    
    try {
      const stats = await fs.stat(targetPath);
      
      if (stats.isDirectory()) {
        if (!recursive) {
          console.log(`Error: '${target}' is a directory. Use 'rm -rf ${target}' to remove.`);
          return;
        }
        await fs.rm(targetPath, { recursive: true, force: true });
        console.log(`Removed directory: ${target}`);
      } else {
        await fs.unlink(targetPath);
        console.log(`Removed: ${target}`);
      }
    } catch (err: any) {
      if (err.code === "ENOENT") {
        console.log(`Error: '${target}' not found`);
      } else {
        console.log(`Error: ${err.message}`);
      }
    }
  }

  private async rmdirCommand(args: string[], context: CommandContext): Promise<void> {
    if (!args[0]) {
      console.log("Usage: rmdir <dir-name>");
      return;
    }
    
    try {
      await fs.rmdir(path.join(context.currentDir, args[0]));
      console.log(`Removed directory: ${args[0]}`);
    } catch (err: any) {
      console.log("Error:", err.message);
    }
  }

  private async mvCommand(args: string[], context: CommandContext): Promise<void> {
    const source = args[0];
    const dest = args[1];
    
    if (!source || !dest) {
      console.log("Usage: mv <source> <destination>");
      return;
    }
    
    try {
      await fs.rename(
        path.join(context.currentDir, source),
        path.join(context.currentDir, dest)
      );
      console.log(`Moved/Renamed: ${source} -> ${dest}`);
    } catch (err: any) {
      console.log("Error:", err.message);
    }
  }

  private async catCommand(args: string[], context: CommandContext): Promise<void> {
    if (!args[0]) {
      console.log("Usage: cat <file>");
      return;
    }
    
    try {
      const stats = await fs.stat(path.join(context.currentDir, args[0]));
      if (stats.isDirectory()) {
        console.log(`cat: ${args[0]}: Is a directory`);
      } else {
        const data = await fs.readFile(path.join(context.currentDir, args[0]), "utf8");
        console.log(data);
      }
    } catch (err: any) {
      if (err.code === "ENOENT") {
        console.log(`cat: ${args[0]}: No such file or directory`);
      } else {
        console.log("cat Error:", err.message);
      }
    }
  }
}
