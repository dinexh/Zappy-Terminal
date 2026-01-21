import type { CommandOutput } from "./output";

export type PresentationMode = "default" | "compact" | "detailed" | "json" | "minimal";

export interface PresentationConfig {
  mode: PresentationMode;
  colors: boolean;
  maxWidth?: number;
  maxTableRows?: number;
  truncateStrings?: number;
  showTimestamps?: boolean;
  jsonPrettyPrint?: boolean;
}

export interface PresentationContext {
  config: PresentationConfig;
  render: (output: CommandOutput) => void;
  setMode: (mode: PresentationMode) => void;
  getMode: () => PresentationMode;
}
