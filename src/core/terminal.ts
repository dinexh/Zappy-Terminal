import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";
import type {
  TerminalConfig,
  CommandContext,
  CommandDefinition,
  PresentationMode,
  PresentationConfig,
} from "../types";
import { PresentationLayer, createPresentationContext } from "./presentation";
import { CommandPipelineImpl, createPipeline } from "./pipeline";
import { CustomCommandRegistry } from "./customCommands";

export class Terminal {
  private config: TerminalConfig;
  private rl: readline.Interface;
  private context: CommandContext;
  private presentation: PresentationLayer;
  private pipeline: CommandPipelineImpl;
  private customRegistry: CustomCommandRegistry;

  constructor(config: TerminalConfig) {
    this.config = config;
    this.presentation = new PresentationLayer(config.presentation);
    this.pipeline = new CommandPipelineImpl();
    this.customRegistry = new CustomCommandRegistry();
    
    this.context = {
      currentDir: process.cwd(),
      homeDir: process.env.HOME || process.env.USERPROFILE || ".",
      prompt: () => this.ask(),
      exit: () => this.close(),
      presentation: this.presentation,
      pipeline: this.pipeline,
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line: string) => this.config.utilities.tabCompleter.complete(line, this.context.currentDir),
    });
  }

  registerCustomCommand(definition: CommandDefinition): void {
    this.customRegistry.register(definition);
  }

  registerCustomCommands(definitions: CommandDefinition[]): void {
    definitions.forEach((def) => this.customRegistry.register(def));
  }

  setPresentationMode(mode: PresentationMode): void {
    this.presentation.setMode(mode);
  }

  getPresentationMode(): PresentationMode {
    return this.presentation.getMode();
  }

  private parseInput(input: string): { command: string; args: string[]; rawInput: string } {
    const parts = input.trim().split(/\s+/);
    const command = parts[0] || "";
    const args = parts.slice(1);
    return { command, args, rawInput: input.trim() };
  }

  private async runCommand(input: string): Promise<void> {
    const { command, args, rawInput } = this.parseInput(input);
    
    if (!command) {
      this.ask();
      return;
    }

    if (command === ":mode") {
      this.handleModeSwitch(args[0] as PresentationMode);
      this.ask();
      return;
    }

    const customCmd = this.customRegistry.get(command);
    if (customCmd) {
      try {
        await this.pipeline.run(rawInput, customCmd, this.context);
        if (!["exit", "bye"].includes(command)) {
          this.ask();
        }
      } catch (error) {
        console.error(`Error executing ${command}:`, error);
        this.ask();
      }
      return;
    }

    const legacyCmd = this.config.registry.getCommand(command);
    if (legacyCmd) {
      try {
        await legacyCmd.handler(args, this.context);
        if (!["git", "exit", "bye"].includes(command)) {
          this.ask();
        }
      } catch (error) {
        console.error(`Error executing ${command}:`, error);
        this.ask();
      }
      return;
    }

    // Auto-cd: if command looks like a directory path, try to cd into it
    const potentialPath = path.resolve(this.context.currentDir, command);
    try {
      const stat = fs.statSync(potentialPath);
      if (stat.isDirectory()) {
        this.context.currentDir = potentialPath;
        process.chdir(potentialPath);
        this.ask();
        return;
      }
    } catch {
      // Not a valid path, fall through to system command
    }

    const systemCommands = new (await import("../commands/system")).SystemCommands();
    systemCommands.systemCommand(command, args, this.context);
  }

  private handleModeSwitch(mode?: PresentationMode): void {
    const validModes: PresentationMode[] = ["default", "compact", "detailed", "json", "minimal"];
    
    if (!mode) {
      console.log(`Current mode: ${this.presentation.getMode()}`);
      console.log(`Available modes: ${validModes.join(", ")}`);
      return;
    }
    
    if (!validModes.includes(mode)) {
      console.log(`Invalid mode. Available modes: ${validModes.join(", ")}`);
      return;
    }
    
    this.presentation.setMode(mode);
    console.log(`Presentation mode set to: ${mode}`);
  }

  private ask(): void {
    const branch = this.config.utilities.git.getBranch(this.context.currentDir);
    const gitStatus = this.config.utilities.git.getStatus(this.context.currentDir);
    const dirDisplay = this.config.utilities.path.formatDir(this.context.currentDir, this.context.homeDir);

    const modeIndicator = this.presentation.getMode() !== "default" 
      ? `[${this.presentation.getMode()}] ` 
      : "";

    const prompt = `${modeIndicator}\x1b[1m\x1b[35mshellx${branch ? ` (${branch})` : ""}${gitStatus} ${dirDisplay}\x1b[0m> `;

    this.rl.question(prompt, async (input: string) => {
      await this.runCommand(input.trim());
    });
  }

  private close(): void {
    this.rl.close();
    process.exit(0);
  }

  public async start(): Promise<void> {
    console.log("\nWelcome to ShellX Terminal");
    console.log("Use :mode <mode> to switch presentation modes (default, compact, detailed, json, minimal)");
    this.ask();
    
    this.rl.on("close", () => {
      console.log("\nGoodbye!");
      process.exit(0);
    });
  }

  getCustomRegistry(): CustomCommandRegistry {
    return this.customRegistry;
  }

  getPresentation(): PresentationLayer {
    return this.presentation;
  }

  getPipeline(): CommandPipelineImpl {
    return this.pipeline;
  }

  getContext(): CommandContext {
    return this.context;
  }
}
