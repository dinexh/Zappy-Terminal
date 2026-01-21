import type { CommandDefinition, CommandOutput } from "../types";
import { defineCommand } from "../core/customCommands";
import { Output, withTitle } from "../core/output";

const FEATURES = {
  customCommands: {
    title: "Custom Commands as First-Class Citizens",
    description: "Create fully customizable commands that behave exactly like built-in ones",
    highlights: [
      "Structured command definitions with parameters and flags",
      "Input validation and type coercion",
      "Composable commands that chain other commands",
      "Documentation with examples and tags",
    ],
  },
  layerArchitecture: {
    title: "Layer-Wise Command Architecture",
    description: "Commands pass through logical stages for predictability and extensibility",
    highlights: [
      "Intent   - Interpret what the user wants",
      "Validate - Check if operation can be performed",
      "Plan     - Create execution plan (enables dry-run)",
      "Execute  - Perform the actual operation",
      "Present  - Format output for display",
    ],
  },
  multiModalOutput: {
    title: "Multi-Modal Output System",
    description: "Commands return structured data, not formatted text",
    highlights: [
      "Text, Table, List, Tree, KeyValue outputs",
      "Success, Error, Warning, Info messages",
      "Progress bars and Diff views",
      "Composite outputs combining multiple types",
    ],
  },
  presentationLayer: {
    title: "Terminal-Controlled Presentation",
    description: "The terminal decides how to render data based on context",
    highlights: [
      "Multiple modes: default, compact, detailed, json, minimal",
      "Switch modes at runtime with :mode <mode>",
      "Consistent styling across all commands",
      "Colors, tables, trees rendered appropriately",
    ],
  },
};

const COMMAND_CATEGORIES = [
  {
    name: "Basic Commands",
    commands: [
      { name: "hi", desc: "Say hello", usage: "hi" },
      { name: "what", desc: "What can I do?", usage: "what" },
      { name: "help", desc: "Show help (legacy)", usage: "help" },
      { name: "clear", desc: "Clear the screen", usage: "clear" },
      { name: "pwd", desc: "Show current directory", usage: "pwd" },
    ],
  },
  {
    name: "Enhanced Commands",
    commands: [
      { name: "lsx", desc: "Rich directory listing", usage: "lsx [path] [--tree] [--long] [--all]" },
      { name: "info", desc: "Detailed file information", usage: "info <path>" },
      { name: "helpx", desc: "Enhanced help system", usage: "helpx [command] [--features]" },
      { name: "env", desc: "Environment information", usage: "env [--all]" },
      { name: "search", desc: "Search for files", usage: "search <pattern> [--recursive]" },
      { name: "du", desc: "Disk usage analysis", usage: "du [path]" },
    ],
  },
  {
    name: "File Commands",
    commands: [
      { name: "ls", desc: "List files", usage: "ls" },
      { name: "cd", desc: "Change directory", usage: "cd <dir>" },
      { name: "mkdir", desc: "Create directory", usage: "mkdir <name>" },
      { name: "touch", desc: "Create empty file", usage: "touch <file>" },
      { name: "rm", desc: "Remove file/directory", usage: "rm <file> | rm -rf <dir>" },
      { name: "rmdir", desc: "Remove empty directory", usage: "rmdir <dir>" },
      { name: "mv", desc: "Move/rename", usage: "mv <src> <dst>" },
      { name: "cat", desc: "View file content", usage: "cat <file>" },
    ],
  },
  {
    name: "System Commands",
    commands: [
      { name: "git", desc: "Run git commands", usage: "git <command> [options]" },
      { name: "exit", desc: "Exit terminal", usage: "exit | bye" },
    ],
  },
  {
    name: "Terminal Controls",
    commands: [
      { name: ":mode", desc: "Switch presentation mode", usage: ":mode <default|compact|detailed|json|minimal>" },
    ],
  },
];

export const helpCommand: CommandDefinition = defineCommand("helpx")
  .aliases("?", "commands", "manual")
  .description("Comprehensive help system with features documentation")
  .usage("helpx [topic] [--features] [--examples] [--all]")
  .category("basic")
  .stringParam("topic", "Command or feature to get help for")
  .boolFlag("features", "Show new features overview", "f")
  .boolFlag("all", "Show everything", "a")
  .boolFlag("categories", "List command categories", "c")
  .onExecute(async (plan) => {
    const params = plan.steps[0].params;
    const topic = params.targets?.[0] || params.topic;
    const showFeatures = params.features || params.all;
    const showCategories = params.categories;
    
    const outputs: CommandOutput[] = [];
    
    outputs.push(Output.text(`
===============================================================================
                    SHELLX TERMINAL v2.0 - Help System                          
===============================================================================

  A modern terminal with custom commands, layered architecture,
  multi-modal output, and intelligent presentation.

-------------------------------------------------------------------------------
`));
    
    if (topic) {
      const featureMatch = Object.entries(FEATURES).find(
        ([key]) => key.toLowerCase().includes(topic.toLowerCase())
      );
      
      if (featureMatch) {
        outputs.push(renderFeature(featureMatch[1]));
      } else {
        const command = COMMAND_CATEGORIES
          .flatMap((cat) => cat.commands)
          .find((cmd) => cmd.name === topic);
        
        if (command) {
          outputs.push(renderCommandHelp(command));
        } else {
          outputs.push(Output.warning(`Topic not found: ${topic}`));
          outputs.push(Output.info("Try: helpx --features or helpx --categories"));
        }
      }
      
      return Output.composite(...outputs);
    }
    
    if (showFeatures) {
      outputs.push(Output.text("\n--- NEW FEATURES ---\n"));
      
      for (const [, feature] of Object.entries(FEATURES)) {
        outputs.push(renderFeature(feature));
      }
    }
    
    if (!showFeatures || showCategories) {
      outputs.push(Output.text("\n--- COMMANDS ---\n"));
      
      for (const category of COMMAND_CATEGORIES) {
        outputs.push(renderCategory(category));
      }
    }
    
    outputs.push(Output.text(`
--- TIPS ---

  * Use :mode json to see structured output as JSON
  * Use :mode detailed for verbose output with timing
  * Enhanced commands (lsx, info, search) use the new architecture
  * See examples/ directory for code samples

-------------------------------------------------------------------------------
`));
    
    return Output.composite(...outputs);
  })
  .build();

function renderFeature(feature: typeof FEATURES.customCommands): CommandOutput {
  const outputs: CommandOutput[] = [];
  outputs.push(Output.text(`\n> ${feature.title}`));
  outputs.push(Output.text(`  ${feature.description}\n`));
  outputs.push(Output.list(feature.highlights.map((h) => ({ content: h })), { style: "dash" }));
  return Output.composite(...outputs);
}

function renderCategory(category: typeof COMMAND_CATEGORIES[0]): CommandOutput {
  const outputs: CommandOutput[] = [];
  outputs.push(Output.text(`\n[${category.name}]\n`));
  const rows = category.commands.map((cmd) => [cmd.name, cmd.desc, cmd.usage]);
  outputs.push(Output.table(["Command", "Description", "Usage"], rows));
  return Output.composite(...outputs);
}

function renderCommandHelp(command: { name: string; desc: string; usage: string }): CommandOutput {
  return Output.composite(
    Output.text(`\n> Command: ${command.name}\n`),
    Output.keyValue([
      { key: "Description", value: command.desc },
      { key: "Usage", value: command.usage },
    ])
  );
}

export const quickRefCommand: CommandDefinition = defineCommand("ref")
  .aliases("cheat", "qr")
  .description("Quick reference card")
  .usage("ref")
  .category("basic")
  .onExecute(async () => {
    return Output.text(`
+-----------------------------------------------------------------------------+
|                         SHELLX TERMINAL QUICK REFERENCE                     |
+-----------------------------------------------------------------------------+
|                                                                             |
|  NAVIGATION            |  FILES                |  ENHANCED                  |
|  ------------------    |  ------------------   |  ------------------        |
|  cd <dir>   change     |  touch <f>  create    |  lsx      rich listing     |
|  pwd        where      |  cat <f>    view      |  info     file details     |
|  ls         list       |  rm <f>     delete    |  search   find files       |
|  clear      clear      |  mv <s> <d> move      |  du       disk usage       |
|                        |  mkdir <d>  dir       |  env      environment      |
|                                                                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  PRESENTATION MODES           |  HELP                                       |
|  -------------------------    |  -------------------------                  |
|  :mode default   standard     |  helpx            full help                 |
|  :mode compact   minimal      |  helpx --features show features             |
|  :mode detailed  verbose      |  helpx <cmd>      command help              |
|  :mode json      raw json     |  ref              this card                 |
|  :mode minimal   essentials   |                                             |
|                                                                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  ENHANCED COMMAND FLAGS                                                     |
|  -------------------------------------------------------------------        |
|  lsx --tree (-t)    show as tree       lsx --long (-l)   detailed view      |
|  lsx --all (-a)     include hidden     search -r         recursive          |
|  env --all (-a)     all variables      info <path>       file metadata      |
|                                                                             |
+-----------------------------------------------------------------------------+
`);
  })
  .build();

export const helpCommands: CommandDefinition[] = [helpCommand, quickRefCommand];
