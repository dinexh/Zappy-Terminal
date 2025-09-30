import type { Command } from "../types";

export class CommandRegistry {
  private commands = new Map<string, Command>();
  private aliases = new Map<string, string>();

  registerCommand(command: Command): void {
    this.commands.set(command.name, command);
    
    if (command.aliases) {
      command.aliases.forEach(alias => {
        this.aliases.set(alias, command.name);
      });
    }
  }

  registerCommands(commands: Command[]): void {
    commands.forEach(command => this.registerCommand(command));
  }

  getCommand(name: string): Command | undefined {
    const commandName = this.aliases.get(name) || name;
    return this.commands.get(commandName);
  }

  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  getCommandNames(): string[] {
    const names = Array.from(this.commands.keys());
    const aliasNames = Array.from(this.aliases.keys());
    return [...names, ...aliasNames].sort();
  }
}

export * from "./basic";
export * from "./filesystem";
export * from "./system";
