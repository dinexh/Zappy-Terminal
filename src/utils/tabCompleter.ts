import * as fs from "fs";
import type { TabCompleterResult } from "../types";

const GIT_SUBCOMMANDS = [
  "add",
  "status",
  "commit",
  "push",
  "pull",
  "branch",
  "checkout",
  "log",
  "diff",
];

const FILE_COMMANDS = ["cd", "touch", "rm", "rmdir", "mv", "cat"];

export class TabCompleter {
  private registry: any;

  constructor(registry: any) {
    this.registry = registry;
  }

  complete(line: string, currentDir: string): [string[], string] {
    const words = line.trim().split(" ");
    const [cmd, ...rest] = words;

    if (words.length === 1) {
      const commandNames = this.registry.getCommandNames();
      const hits = commandNames.filter((c: string) => c.startsWith(cmd || ""));
      return [hits.length ? hits : commandNames, cmd || ""];
    }

    if (FILE_COMMANDS.includes(cmd || "")) {
      const input = rest[rest.length - 1] || "";
      try {
        const files = fs.readdirSync(currentDir);
        const suggestions = files.filter((f) => f.startsWith(input || ""));
        return [suggestions.length ? suggestions : files, input];
      } catch {
        return [[], input];
      }
    }

    if ((cmd || "") === "git" && rest.length >= 1) {
      const currentGitArg = rest[rest.length - 1] || "";
      const hits = GIT_SUBCOMMANDS.filter((c) => c.startsWith(currentGitArg || ""));
      return [hits.length ? hits : GIT_SUBCOMMANDS, currentGitArg];
    }

    return [[], line];
  }
}
