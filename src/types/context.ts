import type { PresentationContext } from "./presentation";
import type { CommandPipeline } from "./pipeline";

export interface CommandContext {
  currentDir: string;
  homeDir: string;
  prompt: () => void;
  exit: () => void;
  presentation: PresentationContext;
  pipeline: CommandPipeline;
}

export interface TerminalConfig {
  registry: any;
  utilities: {
    git: any;
    path: any;
    tabCompleter: any;
  };
  presentation?: Partial<import("./presentation").PresentationConfig>;
}

export interface TabCompleterResult {
  suggestions: string[];
  input: string;
}
