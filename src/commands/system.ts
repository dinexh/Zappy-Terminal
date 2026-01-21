import { exec } from "child_process";
import type { Command, CommandContext } from "../types";

export class SystemCommands {
  getCommands(): Command[] {
    return [
      { name: "git", description: "Run git commands", usage: "git <command> [options]", handler: this.gitCommand.bind(this) },
      { name: "exit", aliases: ["bye"], description: "Exit the terminal", usage: "exit", handler: this.exitCommand.bind(this) }
    ];
  }

  private gitCommand(args: string[], context: CommandContext): void {
    const gitArgs = args.join(" ");
    
    if (!gitArgs) {
      console.log("Usage: git <command> [options]");
      context.prompt();
      return;
    }
    
    exec(`git ${gitArgs}`, { cwd: context.currentDir }, (err, stdout, stderr) => {
      if (err) {
        if (stderr) {
          console.error(stderr.trim());
        } else {
          console.error(`Git Execution Error: ${err.message}`);
        }
      } else {
        if (stdout) {
          console.log(stdout.trim());
        }
        if (stderr) {
          console.error(stderr.trim());
        }
      }
      context.prompt();
    });
  }

  private exitCommand(args: string[], context: CommandContext): void {
    console.log("Goodbye!");
    context.exit();
  }

  systemCommand(command: string, args: string[], context: CommandContext): void {
    exec(
      `${command} ${args.join(" ")}`,
      { cwd: context.currentDir },
      (error, stdout, stderr) => {
        if (error) {
          if (error.code === 127 || (process.platform === "win32" && error.message.includes("is not recognized"))) {
            console.log(`Command not found: ${command}`);
          } else {
            if (stderr) {
              console.error(stderr.trim());
            } else {
              console.error(`Exec Error: ${error.message}`);
            }
          }
        } else {
          if (stdout) console.log(stdout.trim());
          if (stderr) console.error(stderr.trim());
        }
        context.prompt();
      }
    );
  }
}
