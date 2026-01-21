import * as fs from "fs/promises";
import * as path from "path";
import type {
  CommandDefinition,
  CommandContext,
  CommandIntent,
  CommandOutput,
  ExecutionContext,
  ExecutionPlan,
  ParameterDefinition,
  FlagDefinition,
  ParsedInput,
  ValidationResult,
  ComposableStep,
} from "../types";
import { Output } from "./output";
import { createStep, createPlan } from "./pipeline";

export class CustomCommandBuilder {
  private definition: Partial<CommandDefinition> = {};
  
  constructor(name: string) {
    this.definition.name = name;
  }
  
  aliases(...aliases: string[]): this {
    this.definition.aliases = aliases;
    return this;
  }
  
  description(desc: string): this {
    this.definition.description = desc;
    return this;
  }
  
  usage(usage: string): this {
    this.definition.usage = usage;
    return this;
  }
  
  category(category: string): this {
    this.definition.category = category;
    return this;
  }
  
  parameter(param: ParameterDefinition): this {
    if (!this.definition.parameters) {
      this.definition.parameters = [];
    }
    this.definition.parameters.push(param);
    return this;
  }
  
  stringParam(name: string, description: string, options: Partial<ParameterDefinition> = {}): this {
    return this.parameter({ name, type: "string", description, ...options });
  }
  
  pathParam(name: string, description: string, options: Partial<ParameterDefinition> = {}): this {
    return this.parameter({ name, type: "path", description, ...options });
  }
  
  numberParam(name: string, description: string, options: Partial<ParameterDefinition> = {}): this {
    return this.parameter({ name, type: "number", description, ...options });
  }
  
  choiceParam(name: string, description: string, choices: string[], options: Partial<ParameterDefinition> = {}): this {
    return this.parameter({ name, type: "choice", description, choices, ...options });
  }
  
  flag(flag: FlagDefinition): this {
    if (!this.definition.flags) {
      this.definition.flags = [];
    }
    this.definition.flags.push(flag);
    return this;
  }
  
  boolFlag(name: string, description: string, short?: string): this {
    return this.flag({ name, short, description, type: "boolean", default: false });
  }
  
  stringFlag(name: string, description: string, short?: string, defaultValue?: string): this {
    return this.flag({ name, short, description, type: "string", default: defaultValue });
  }
  
  onIntent(handler: (input: ParsedInput) => Promise<CommandIntent> | CommandIntent): this {
    if (!this.definition.layers) {
      this.definition.layers = {};
    }
    this.definition.layers.intent = handler;
    return this;
  }
  
  onValidate(handler: (intent: CommandIntent, context: CommandContext) => Promise<ValidationResult> | ValidationResult): this {
    if (!this.definition.layers) {
      this.definition.layers = {};
    }
    this.definition.layers.validate = handler;
    return this;
  }
  
  onPlan(handler: (intent: CommandIntent, context: CommandContext) => Promise<ExecutionPlan> | ExecutionPlan): this {
    if (!this.definition.layers) {
      this.definition.layers = {};
    }
    this.definition.layers.plan = handler;
    return this;
  }
  
  onExecute(handler: (plan: ExecutionPlan, context: ExecutionContext) => Promise<CommandOutput> | CommandOutput): this {
    if (!this.definition.layers) {
      this.definition.layers = {};
    }
    this.definition.layers.execute = handler;
    return this;
  }
  
  handler(handler: (args: string[], context: CommandContext) => Promise<void> | void): this {
    this.definition.handler = handler;
    return this;
  }
  
  compose(...steps: ComposableStep[]): this {
    this.definition.compose = steps;
    return this;
  }
  
  example(description: string, command: string, output?: string): this {
    if (!this.definition.examples) {
      this.definition.examples = [];
    }
    this.definition.examples.push({ description, command, output });
    return this;
  }
  
  tags(...tags: string[]): this {
    this.definition.tags = tags;
    return this;
  }
  
  build(): CommandDefinition {
    if (!this.definition.name) {
      throw new Error("Command name is required");
    }
    if (!this.definition.description) {
      this.definition.description = "";
    }
    if (!this.definition.usage) {
      this.definition.usage = this.definition.name;
    }
    return this.definition as CommandDefinition;
  }
}

export function defineCommand(name: string): CustomCommandBuilder {
  return new CustomCommandBuilder(name);
}

export class CustomCommandRegistry {
  private definitions = new Map<string, CommandDefinition>();
  private aliases = new Map<string, string>();
  private categories = new Map<string, Set<string>>();
  
  register(definition: CommandDefinition): void {
    this.definitions.set(definition.name, definition);
    
    if (definition.aliases) {
      definition.aliases.forEach((alias) => {
        this.aliases.set(alias, definition.name);
      });
    }
    
    const category = definition.category || "general";
    if (!this.categories.has(category)) {
      this.categories.set(category, new Set());
    }
    this.categories.get(category)!.add(definition.name);
  }
  
  registerAll(...definitions: CommandDefinition[]): void {
    definitions.forEach((def) => this.register(def));
  }
  
  get(name: string): CommandDefinition | undefined {
    const resolvedName = this.aliases.get(name) || name;
    return this.definitions.get(resolvedName);
  }
  
  has(name: string): boolean {
    const resolvedName = this.aliases.get(name) || name;
    return this.definitions.has(resolvedName);
  }
  
  getAll(): CommandDefinition[] {
    return Array.from(this.definitions.values());
  }
  
  getByCategory(category: string): CommandDefinition[] {
    const names = this.categories.get(category);
    if (!names) return [];
    return Array.from(names).map((name) => this.definitions.get(name)!);
  }
  
  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }
  
  getCommandNames(): string[] {
    const names = Array.from(this.definitions.keys());
    const aliasNames = Array.from(this.aliases.keys());
    return [...names, ...aliasNames].sort();
  }
  
  search(query: string): CommandDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter((def) => {
      return (
        def.name.toLowerCase().includes(lowerQuery) ||
        def.description.toLowerCase().includes(lowerQuery) ||
        def.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }
  
  exportDefinitions(): string {
    const defs = this.getAll().map((def) => ({
      name: def.name,
      aliases: def.aliases,
      description: def.description,
      usage: def.usage,
      category: def.category,
      parameters: def.parameters,
      flags: def.flags,
      examples: def.examples,
      tags: def.tags,
    }));
    return JSON.stringify(defs, null, 2);
  }
}

export function createCustomRegistry(): CustomCommandRegistry {
  return new CustomCommandRegistry();
}

export const CustomCommands = {
  fileOperation(
    name: string,
    description: string,
    operation: (targetPath: string, context: ExecutionContext) => Promise<CommandOutput>
  ): CommandDefinition {
    return defineCommand(name)
      .description(description)
      .usage(`${name} <path>`)
      .category("filesystem")
      .pathParam("path", "Target file or directory path", { required: true })
      .onValidate(async (intent, context) => {
        const targetPath = intent.targets[0];
        if (!targetPath) {
          return { valid: false, error: "Path is required" };
        }
        return { valid: true };
      })
      .onExecute(async (plan, context) => {
        const targetPath = plan.steps[0]?.params.path || plan.steps[0]?.params.targets?.[0];
        const fullPath = path.resolve(context.currentDir, targetPath);
        return operation(fullPath, context);
      })
      .build();
  },
  
  withConfirmation(
    definition: CommandDefinition,
    confirmMessage: (intent: CommandIntent) => string
  ): CommandDefinition {
    const originalValidate = definition.layers?.validate;
    
    return {
      ...definition,
      flags: [
        ...(definition.flags || []),
        { name: "force", short: "f", description: "Skip confirmation", type: "boolean" as const, default: false },
        { name: "yes", short: "y", description: "Auto-confirm", type: "boolean" as const, default: false },
      ],
      layers: {
        ...definition.layers,
        validate: async (intent, context) => {
          if (originalValidate) {
            const result = await originalValidate(intent, context);
            if (!result.valid) return result;
          }
          
          const force = intent.options.force || intent.options.yes;
          if (!force) {
            const message = confirmMessage(intent);
            return { valid: true, warnings: [`This action requires confirmation: ${message}`] };
          }
          
          return { valid: true };
        },
      },
    };
  },
  
  withDryRun(definition: CommandDefinition): CommandDefinition {
    return {
      ...definition,
      flags: [
        ...(definition.flags || []),
        { name: "dry-run", short: "n", description: "Show what would be done without making changes", type: "boolean" as const, default: false },
      ],
    };
  },
};

export async function loadCommandsFromFile(filePath: string): Promise<CommandDefinition[]> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      throw new Error("Commands file must contain an array of command definitions");
    }
    
    return data.map((def: any) => ({
      name: def.name,
      aliases: def.aliases,
      description: def.description || "",
      usage: def.usage || def.name,
      category: def.category,
      parameters: def.parameters,
      flags: def.flags,
      examples: def.examples,
      tags: def.tags,
    }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function saveCommandsToFile(
  filePath: string,
  definitions: CommandDefinition[]
): Promise<void> {
  const data = definitions.map((def) => ({
    name: def.name,
    aliases: def.aliases,
    description: def.description,
    usage: def.usage,
    category: def.category,
    parameters: def.parameters,
    flags: def.flags,
    examples: def.examples,
    tags: def.tags,
  }));
  
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
