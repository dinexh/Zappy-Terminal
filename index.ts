#!/usr/bin/env bun

/**
 * Zappy Terminal - A modern, modular terminal implementation
 * Entry point that manages all imports and initializes the terminal
 */

// Core imports
import { Terminal } from './src/core/terminal';
import { CommandRegistry } from './src/commands/index';

// Command imports
import { BasicCommands } from './src/commands/basic';
import { FilesystemCommands } from './src/commands/filesystem';
import { SystemCommands } from './src/commands/system';

// Utility imports
import { GitUtils } from './src/utils/git';
import { PathUtils } from './src/utils/path';
import { TabCompleter } from './src/utils/tabCompleter';

// Type imports
import type { Command, CommandContext } from './src/types/index';

/**
 * Initialize and configure the terminal with all available commands
 */
async function initializeTerminal(): Promise<Terminal> {
  // Create command registry
  const registry = new CommandRegistry();
  
  // Create command instances
  const basicCommands = new BasicCommands();
  const filesystemCommands = new FilesystemCommands();
  const systemCommands = new SystemCommands();
  
  // Register all commands
  registry.registerCommands(basicCommands.getCommands());
  registry.registerCommands(filesystemCommands.getCommands());
  registry.registerCommands(systemCommands.getCommands());
  
  // Create utilities
  const gitUtils = new GitUtils();
  const pathUtils = new PathUtils();
  const tabCompleter = new TabCompleter(registry);
  
  // Create terminal instance
  const terminal = new Terminal({
    registry,
    utilities: {
      git: gitUtils,
      path: pathUtils,
      tabCompleter
    }
  });
  
  return terminal;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    console.log("🚀 Welcome to Zappy Terminal!");
    console.log("A modern, modular terminal implementation");
    console.log("Type 'help' for available commands or 'exit' to quit.\n");
    
    // Initialize terminal
    const terminal = await initializeTerminal();
    
    // Start the terminal
    await terminal.start();
    
  } catch (error) {
    console.error("❌ Failed to initialize terminal:", error);
    process.exit(1);
  }
}

/**
 * Handle uncaught exceptions and unhandled rejections
 */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Export for potential use as a module
export { Terminal, CommandRegistry, BasicCommands, FilesystemCommands, SystemCommands };
export { GitUtils, PathUtils, TabCompleter };
export type { Command, CommandContext };

// Run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}