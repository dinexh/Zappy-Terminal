export interface CommandArgs {
  command: string;
  args: string[];
  target?: string;
}

export interface CommandContext {
  currentDir: string;
  homeDir: string;
  prompt: () => void;
  exit: () => void;
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  handler: (args: string[], context: CommandContext) => Promise<void> | void;
}

export interface TabCompleterResult {
  suggestions: string[];
  input: string;
}

export interface TerminalConfig {
  registry: any;
  utilities: {
    git: any;
    path: any;
    tabCompleter: any;
  };
}
