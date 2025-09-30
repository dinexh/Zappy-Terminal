/**
 * Main entry point - redirects to the index.ts file for full initialization
 */
console.log("🚀 Starting Zappy Terminal...");
console.log("For the full modular experience, run: bun run index.ts");

// Simple fallback initialization
import { Terminal } from "./core/terminal";
import { CommandRegistry } from "./commands/index";
import { BasicCommands } from "./commands/basic";
import { FilesystemCommands } from "./commands/filesystem";
import { SystemCommands } from "./commands/system";
import { GitUtils } from "./utils/git";
import { PathUtils } from "./utils/path";
import { TabCompleter } from "./utils/tabCompleter";

// Initialize components
const registry = new CommandRegistry();
const basicCommands = new BasicCommands();
const filesystemCommands = new FilesystemCommands();
const systemCommands = new SystemCommands();

// Register commands
registry.registerCommands(basicCommands.getCommands());
registry.registerCommands(filesystemCommands.getCommands());
registry.registerCommands(systemCommands.getCommands());

// Create utilities
const gitUtils = new GitUtils();
const pathUtils = new PathUtils();
const tabCompleter = new TabCompleter(registry);

// Create and start terminal
const terminal = new Terminal({
  registry,
  utilities: {
    git: gitUtils,
    path: pathUtils,
    tabCompleter
  }
});

terminal.start();
