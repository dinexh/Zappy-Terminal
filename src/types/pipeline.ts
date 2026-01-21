import type { CommandContext } from "./context";
import type { CommandOutput } from "./output";
import type { CommandDefinition } from "./command";

export interface ParsedInput {
  command: string;
  args: string[];
  flags: Record<string, boolean | string | number>;
  rawInput: string;
  parameters: Record<string, any>;
}

export interface CommandIntent {
  action: string;
  targets: string[];
  options: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export interface ExecutionStep {
  id: string;
  action: string;
  description: string;
  params: Record<string, any>;
  dependencies?: string[];
  rollback?: () => Promise<void>;
}

export interface ImpactAssessment {
  filesAffected?: number;
  bytesChanged?: number;
  destructive?: boolean;
  warnings?: string[];
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  dryRun?: boolean;
  reversible?: boolean;
  rollbackSteps?: ExecutionStep[];
  estimatedImpact?: ImpactAssessment;
}

export interface ExecutionEvent {
  type: "info" | "warning" | "error" | "progress" | "debug";
  message: string;
  timestamp: number;
  data?: any;
}

export interface StepTrace {
  stepId: string;
  startTime: number;
  endTime?: number;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  result?: any;
  error?: Error;
}

export interface ExecutionTrace {
  startTime: number;
  steps: StepTrace[];
  events: ExecutionEvent[];
}

export interface ExecutionContext extends CommandContext {
  plan: ExecutionPlan;
  dryRun: boolean;
  trace: ExecutionTrace;
  emit: (event: ExecutionEvent) => void;
}

export interface CommandPipeline {
  parse: (input: string, definition: CommandDefinition) => ParsedInput;
  interpret: (input: ParsedInput, definition: CommandDefinition) => Promise<CommandIntent>;
  validate: (intent: CommandIntent, definition: CommandDefinition, context: CommandContext) => Promise<ValidationResult>;
  plan: (intent: CommandIntent, definition: CommandDefinition, context: CommandContext) => Promise<ExecutionPlan>;
  execute: (plan: ExecutionPlan, definition: CommandDefinition, context: ExecutionContext) => Promise<CommandOutput>;
  present: (output: CommandOutput, context: any) => void;
  run: (input: string, definition: CommandDefinition, context: CommandContext) => Promise<CommandOutput>;
  dryRun: (input: string, definition: CommandDefinition, context: CommandContext) => Promise<ExecutionPlan>;
}
