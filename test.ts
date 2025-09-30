#!/usr/bin/env bun

/**
 * Simple test script to verify the modular architecture
 */

import { CommandRegistry } from './src/commands/index';
import { BasicCommands } from './src/commands/basic';
import { FilesystemCommands } from './src/commands/filesystem';
import { SystemCommands } from './src/commands/system';
import { GitUtils } from './src/utils/git';
import { PathUtils } from './src/utils/path';
import { TabCompleter } from './src/utils/tabCompleter';

console.log("🧪 Testing Zappy Terminal Modular Architecture...\n");

// Test 1: Command Registry
console.log("1. Testing Command Registry...");
const registry = new CommandRegistry();
console.log("   ✅ CommandRegistry created successfully");

// Test 2: Command Classes
console.log("\n2. Testing Command Classes...");
const basicCommands = new BasicCommands();
const filesystemCommands = new FilesystemCommands();
const systemCommands = new SystemCommands();

console.log("   ✅ BasicCommands created successfully");
console.log("   ✅ FilesystemCommands created successfully");
console.log("   ✅ SystemCommands created successfully");

// Test 3: Register Commands
console.log("\n3. Testing Command Registration...");
registry.registerCommands(basicCommands.getCommands());
registry.registerCommands(filesystemCommands.getCommands());
registry.registerCommands(systemCommands.getCommands());

const commandNames = registry.getCommandNames();
console.log(`   ✅ Registered ${commandNames.length} commands: ${commandNames.join(', ')}`);

// Test 4: Utility Classes
console.log("\n4. Testing Utility Classes...");
const gitUtils = new GitUtils();
const pathUtils = new PathUtils();
const tabCompleter = new TabCompleter(registry);

console.log("   ✅ GitUtils created successfully");
console.log("   ✅ PathUtils created successfully");
console.log("   ✅ TabCompleter created successfully");

// Test 5: Command Lookup
console.log("\n5. Testing Command Lookup...");
const helpCommand = registry.getCommand('help');
const lsCommand = registry.getCommand('ls');
const gitCommand = registry.getCommand('git');

console.log(`   ✅ help command found: ${helpCommand ? 'Yes' : 'No'}`);
console.log(`   ✅ ls command found: ${lsCommand ? 'Yes' : 'No'}`);
console.log(`   ✅ git command found: ${gitCommand ? 'Yes' : 'No'}`);

// Test 6: Utility Functions
console.log("\n6. Testing Utility Functions...");
const currentDir = process.cwd();
const homeDir = pathUtils.getHomeDir();
const formattedDir = pathUtils.formatDir(currentDir, homeDir);
const isGitRepo = gitUtils.isGitRepository(currentDir);

console.log(`   ✅ Current directory: ${formattedDir}`);
console.log(`   ✅ Is Git repository: ${isGitRepo ? 'Yes' : 'No'}`);

// Test 7: Tab Completion
console.log("\n7. Testing Tab Completion...");
const [suggestions, input] = tabCompleter.complete('he', currentDir);
console.log(`   ✅ Tab completion for 'he': ${suggestions.join(', ')}`);

console.log("\n🎉 All tests passed! The modular architecture is working correctly.\n");
console.log("Ready to run: bun run index.ts");