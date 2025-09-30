import type { Command, CommandContext } from "../types";

export class BasicCommands {
  getCommands(): Command[] {
    return [
      {
        name: "hi",
        description: "Say hello",
        usage: "hi",
        handler: this.hiCommand
      },
      {
        name: "what",
        description: "What can I do?",
        usage: "what",
        handler: this.whatCommand
      },
      {
        name: "help",
        description: "Show available commands",
        usage: "help",
        handler: this.helpCommand
      },
      {
        name: "clear",
        description: "Clear the screen",
        usage: "clear",
        handler: this.clearCommand
      },
      {
        name: "pwd",
        description: "Show current directory",
        usage: "pwd",
        handler: this.pwdCommand
      }
    ];
  }

  private hiCommand(args: string[], context: CommandContext): void {
    console.log("hello");
  }

  private whatCommand(args: string[], context: CommandContext): void {
    console.log("I can say hi, help you, and manage files/folders!");
  }

  private helpCommand(args: string[], context: CommandContext): void {
    console.log(`
🚀 Zappy Terminal - Available Commands:

Basic Commands:
  hi           → Say hello
  what         → What can I do?
  help         → Show this help message
  clear        → Clear the screen
  pwd          → Show current directory

File & Directory Commands:
  ls           → List files in current directory
  cd <dir>     → Change directory
  mkdir <dir>  → Create a directory
  touch <file> → Create an empty file
  rm <file>    → Delete a file
  rm -rf <dir> → Delete a directory recursively
  rmdir <dir>  → Delete an empty directory
  mv <src> <dst> → Rename or move file/folder
  cat <file>   → View file content

System Commands:
  git <...>    → Run git commands
  exit / bye   → Exit the terminal
    `);
  }

  private clearCommand(args: string[], context: CommandContext): void {
    console.clear();
  }

  private pwdCommand(args: string[], context: CommandContext): void {
    console.log(context.currentDir);
  }
}
