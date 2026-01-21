import * as fs from "fs";
import * as path from "path";
import type { CommandRegistry } from "../commands/index";

export class TabCompleter {
  private registry: CommandRegistry;

  constructor(registry: CommandRegistry) {
    this.registry = registry;
  }

  complete(line: string, currentDir: string): [string[], string] {
    const parts = line.trim().split(/\s+/);
    const lastPart = parts[parts.length - 1] || "";

    if (parts.length <= 1) {
      const commands = this.registry.getCommandNames();
      const matches = commands.filter(cmd => cmd.startsWith(lastPart));
      return [matches, line];
    }

    try {
      const searchDir = lastPart.includes("/") 
        ? path.join(currentDir, path.dirname(lastPart))
        : currentDir;
      const searchPrefix = lastPart.includes("/")
        ? path.basename(lastPart)
        : lastPart;

      const items = fs.readdirSync(searchDir);
      const matches = items
        .filter(item => item.startsWith(searchPrefix))
        .map(item => {
          const fullPath = path.join(searchDir, item);
          const isDir = fs.statSync(fullPath).isDirectory();
          return isDir ? item + "/" : item;
        });

      return [matches, line];
    } catch {
      return [[], line];
    }
  }
}
