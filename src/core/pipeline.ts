import type {
  CommandDefinition,
  CommandContext,
  CommandIntent,
  CommandOutput,
  CommandPipeline,
  ExecutionContext,
  ExecutionEvent,
  ExecutionPlan,
  ExecutionStep,
  ExecutionTrace,
  ParsedInput,
  PresentationContext,
  ValidationResult,
} from "../types";
import { Output } from "./output";

export class CommandPipelineImpl implements CommandPipeline {
  parse(input: string, definition: CommandDefinition): ParsedInput {
    const parts = this.tokenize(input);
    const command = parts[0] || "";
    const rawArgs = parts.slice(1);
    
    const flags: Record<string, boolean | string | number> = {};
    const positionalArgs: string[] = [];
    
    let i = 0;
    while (i < rawArgs.length) {
      const arg = rawArgs[i];
      
      if (arg.startsWith("--")) {
        const flagName = arg.slice(2);
        const flagDef = definition.flags?.find((f) => f.name === flagName);
        
        if (flagDef?.type === "boolean") {
          flags[flagName] = true;
        } else if (i + 1 < rawArgs.length) {
          const value = rawArgs[i + 1];
          flags[flagName] = flagDef?.type === "number" ? Number(value) : value;
          i++;
        }
      } else if (arg.startsWith("-") && arg.length === 2) {
        const shortFlag = arg.slice(1);
        const flagDef = definition.flags?.find((f) => f.short === shortFlag);
        
        if (flagDef) {
          if (flagDef.type === "boolean") {
            flags[flagDef.name] = true;
          } else if (i + 1 < rawArgs.length) {
            const value = rawArgs[i + 1];
            flags[flagDef.name] = flagDef.type === "number" ? Number(value) : value;
            i++;
          }
        } else {
          for (const char of arg.slice(1)) {
            const combinedFlagDef = definition.flags?.find((f) => f.short === char);
            if (combinedFlagDef && combinedFlagDef.type === "boolean") {
              flags[combinedFlagDef.name] = true;
            }
          }
        }
      } else {
        positionalArgs.push(arg);
      }
      i++;
    }
    
    definition.flags?.forEach((flagDef) => {
      if (!(flagDef.name in flags) && flagDef.default !== undefined) {
        flags[flagDef.name] = flagDef.default;
      }
    });
    
    const parameters: Record<string, any> = {};
    const paramDefs = definition.parameters || [];
    
    paramDefs.forEach((paramDef, index) => {
      if (index < positionalArgs.length) {
        let value: any = positionalArgs[index];
        
        if (paramDef.type === "number") {
          value = Number(value);
        } else if (paramDef.type === "boolean") {
          value = value === "true" || value === "1" || value === "yes";
        } else if (paramDef.type === "array") {
          value = positionalArgs.slice(index);
        }
        
        if (paramDef.transform) {
          value = paramDef.transform(value);
        }
        
        parameters[paramDef.name] = value;
      } else if (paramDef.default !== undefined) {
        parameters[paramDef.name] = paramDef.default;
      }
    });
    
    return { command, args: positionalArgs, flags, rawInput: input, parameters };
  }
  
  private tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let inQuote = false;
    let quoteChar = "";
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      
      if (inQuote) {
        if (char === quoteChar) {
          inQuote = false;
        } else {
          current += char;
        }
      } else if (char === '"' || char === "'") {
        inQuote = true;
        quoteChar = char;
      } else if (char === " " || char === "\t") {
        if (current) {
          tokens.push(current);
          current = "";
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      tokens.push(current);
    }
    
    return tokens;
  }
  
  async interpret(input: ParsedInput, definition: CommandDefinition): Promise<CommandIntent> {
    if (definition.layers?.intent) {
      return definition.layers.intent(input);
    }
    
    return {
      action: input.command,
      targets: input.args,
      options: { ...input.flags, ...input.parameters },
    };
  }
  
  async validate(
    intent: CommandIntent,
    definition: CommandDefinition,
    context: CommandContext
  ): Promise<ValidationResult> {
    if (definition.layers?.validate) {
      return definition.layers.validate(intent, context);
    }
    
    const warnings: string[] = [];
    const paramDefs = definition.parameters || [];
    
    for (const paramDef of paramDefs) {
      if (paramDef.required) {
        const value = intent.options[paramDef.name];
        if (value === undefined || value === null || value === "") {
          return { valid: false, error: `Required parameter '${paramDef.name}' is missing` };
        }
      }
      
      if (paramDef.validate) {
        const result = paramDef.validate(intent.options[paramDef.name]);
        if (!result.valid) {
          return result;
        }
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      }
      
      if (paramDef.choices && intent.options[paramDef.name] !== undefined) {
        const value = intent.options[paramDef.name];
        if (!paramDef.choices.includes(value)) {
          return {
            valid: false,
            error: `Invalid value '${value}' for parameter '${paramDef.name}'. Valid options: ${paramDef.choices.join(", ")}`,
          };
        }
      }
    }
    
    return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
  }
  
  async plan(
    intent: CommandIntent,
    definition: CommandDefinition,
    context: CommandContext
  ): Promise<ExecutionPlan> {
    if (definition.layers?.plan) {
      return definition.layers.plan(intent, context);
    }
    
    if (definition.compose) {
      const steps: ExecutionStep[] = definition.compose.map((step, index) => ({
        id: `step-${index}`,
        action: step.command,
        description: `Execute ${step.command}`,
        params: step.args || {},
        dependencies: index > 0 ? [`step-${index - 1}`] : undefined,
      }));
      
      return { steps, reversible: false };
    }
    
    return {
      steps: [{
        id: "execute",
        action: intent.action,
        description: `Execute ${definition.name}`,
        params: intent.options,
      }],
      reversible: false,
    };
  }
  
  async execute(
    plan: ExecutionPlan,
    definition: CommandDefinition,
    context: ExecutionContext
  ): Promise<CommandOutput> {
    if (definition.layers?.execute) {
      return definition.layers.execute(plan, context);
    }
    
    if (definition.handler) {
      const args = plan.steps[0]?.params.targets || [];
      await definition.handler(Array.isArray(args) ? args : [args], context);
      return Output.text("");
    }
    
    return Output.error("Command execution not implemented");
  }
  
  present(output: CommandOutput, context: PresentationContext): void {
    context.render(output);
  }
  
  async run(
    input: string,
    definition: CommandDefinition,
    context: CommandContext
  ): Promise<CommandOutput> {
    const startTime = Date.now();
    const trace: ExecutionTrace = { startTime, steps: [], events: [] };
    
    try {
      const parsedInput = this.parse(input, definition);
      const intent = await this.interpret(parsedInput, definition);
      const validation = await this.validate(intent, definition, context);
      
      if (!validation.valid) {
        return Output.error(validation.error || "Validation failed");
      }
      
      if (validation.warnings && validation.warnings.length > 0) {
        validation.warnings.forEach((w) => {
          console.log(`[WARN] ${w}`);
        });
      }
      
      const plan = await this.plan(intent, definition, context);
      
      const execContext: ExecutionContext = {
        ...context,
        plan,
        dryRun: false,
        trace,
        emit: (event: ExecutionEvent) => {
          trace.events.push(event);
        },
      };
      
      const output = await this.execute(plan, definition, execContext);
      
      if (output.metadata) {
        output.metadata.duration = Date.now() - startTime;
      } else {
        output.metadata = { duration: Date.now() - startTime };
      }
      
      if (output.type !== "text" || output.data) {
        this.present(output, context.presentation);
      }
      
      return output;
    } catch (error) {
      const errorOutput = Output.error(
        error instanceof Error ? error.message : String(error),
        { stack: error instanceof Error ? error.stack : undefined }
      );
      this.present(errorOutput, context.presentation);
      return errorOutput;
    }
  }
  
  async dryRun(
    input: string,
    definition: CommandDefinition,
    context: CommandContext
  ): Promise<ExecutionPlan> {
    const parsedInput = this.parse(input, definition);
    const intent = await this.interpret(parsedInput, definition);
    const validation = await this.validate(intent, definition, context);
    
    if (!validation.valid) {
      throw new Error(validation.error || "Validation failed");
    }
    
    const plan = await this.plan(intent, definition, context);
    plan.dryRun = true;
    
    return plan;
  }
}

export function createPipeline(): CommandPipeline {
  return new CommandPipelineImpl();
}

export const defaultPipeline = new CommandPipelineImpl();

export function createStep(
  id: string,
  action: string,
  description: string,
  params: Record<string, any> = {},
  dependencies?: string[]
): ExecutionStep {
  return { id, action, description, params, dependencies };
}

export function createPlan(steps: ExecutionStep[], options: Partial<ExecutionPlan> = {}): ExecutionPlan {
  return { steps, ...options };
}

export function emitEvent(
  context: ExecutionContext,
  type: ExecutionEvent["type"],
  message: string,
  data?: any
): void {
  context.emit({ type, message, timestamp: Date.now(), data });
}

export function logProgress(context: ExecutionContext, message: string): void {
  emitEvent(context, "progress", message);
}

export function logDebug(context: ExecutionContext, message: string, data?: any): void {
  emitEvent(context, "debug", message, data);
}
