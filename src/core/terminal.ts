import * as readline from "readline";
import type { TerminalConfig, CommandContext } from "../types";

export class Terminal {
  private config: TerminalConfig;
  private rl: readline.Interface;
  private context: CommandContext;

  constructor(config: TerminalConfig) {
    this.config = config;
    
    this.context = {
      currentDir: process.cwd(),
      homeDir: process.env.HOME || process.env.USERPROFILE || ".",
      prompt: () => this.ask(),
      exit: () => this.close()
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line: string) => this.config.utilities.tabCompleter.complete(line, this.context.currentDir),
    });
  }

  private parseInput(input: string): { command: string; args: string[] } {
    const parts = input.trim().split(" ");
    const command = parts[0] || "";
    const args = parts.slice(1);

    return { command, args };
  }

  private async runCommand(input: string): Promise<void> {
    const { command, args } = this.parseInput(input);
    
    if (!command) {
      this.ask();
      return;
    }

    // Get command from registry
    const cmd = this.config.registry.getCommand(command);
    
    if (cmd) {
      try {
        await cmd.handler(args, this.context);
        // Don't call prompt automatically for git and exit commands
        if (!["git", "exit", "bye"].includes(command)) {
          this.ask();
        }
      } catch (error) {
        console.error(`Error executing ${command}:`, error);
        this.ask();
      }
    } else {
      // Try to execute as system command
      const systemCommands = new (await import("../commands/system")).SystemCommands();
      systemCommands.systemCommand(command, args, this.context);
    }
  }

  private ask(): void {
    const branch = this.config.utilities.git.getBranch(this.context.currentDir);
    const gitStatus = this.config.utilities.git.getStatus(this.context.currentDir);
    const dirDisplay = this.config.utilities.path.formatDir(this.context.currentDir, this.context.homeDir);

    const prompt = `\x1b[1m\x1b[35mzappy${branch ? ` (${branch})` : ""}${gitStatus} ${dirDisplay}\x1b[0m> `;

    this.rl.question(prompt, async (input: string) => {
      await this.runCommand(input.trim());
    });
  }

  private close(): void {
    this.rl.close();
    process.exit(0);
  }

  public async start(): Promise<void> {
    console.log("\nHey there! I'm Zappy, your friendly terminal!");
    this.ask();
    
    // Handle Ctrl+C
    this.rl.on("close", () => {
      console.log("\nGoodbye! 👋");
      process.exit(0);
    });
  }
}
