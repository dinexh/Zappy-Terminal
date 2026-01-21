import type { CommandContext } from "./context";
import type { CommandOutput } from "./output";
import type { ParsedInput, CommandIntent, ExecutionPlan, ExecutionContext, ValidationResult } from "./pipeline";

export type ParameterType = "string" | "number" | "boolean" | "path" | "choice" | "array";

export interface ParameterDefinition {
  name: string;
  type: ParameterType;
  description: string;
  required?: boolean;
  default?: any;
  choices?: string[];
  validate?: (value: any) => ValidationResult;
  transform?: (value: any) => any;
}

export interface FlagDefinition {
  name: string;
  short?: string;
  description: string;
  type: "boolean" | "string" | "number";
  default?: any;
}

export interface CommandExample {
  description: string;
  command: string;
  output?: string;
}

export interface ComposableStep {
  command: string;
  args?: Record<string, any>;
  condition?: (context: ExecutionContext) => boolean;
  onError?: "stop" | "continue" | "rollback";
}

export interface CommandLayers {
  intent?: (input: ParsedInput) => Promise<CommandIntent> | CommandIntent;
  validate?: (intent: CommandIntent, context: CommandContext) => Promise<ValidationResult> | ValidationResult;
  plan?: (intent: CommandIntent, context: CommandContext) => Promise<ExecutionPlan> | ExecutionPlan;
  execute?: (plan: ExecutionPlan, context: ExecutionContext) => Promise<CommandOutput> | CommandOutput;
  present?: (output: CommandOutput, context: any) => void;
}

export interface CommandDefinition {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  category?: string;
  parameters?: ParameterDefinition[];
  flags?: FlagDefinition[];
  layers?: CommandLayers;
  handler?: (args: string[], context: CommandContext) => Promise<void> | void;
  compose?: ComposableStep[];
  examples?: CommandExample[];
  tags?: string[];
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  handler: (args: string[], context: CommandContext) => Promise<void> | void;
}

export interface CommandArgs {
  command: string;
  args: string[];
  target?: string;
  flags?: Record<string, boolean | string>;
  rawInput?: string;
}
