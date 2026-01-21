console.log("Starting ShellX Terminal...");

import { Terminal } from "./core/terminal";
import { CommandRegistry } from "./commands/index";
import { BasicCommands } from "./commands/basic";
import { FilesystemCommands } from "./commands/filesystem";
import { SystemCommands } from "./commands/system";
import { GitUtils } from "./utils/git";
import { PathUtils } from "./utils/path";
import { TabCompleter } from "./utils/tabCompleter";
import { enhancedCommands } from "./commands/enhanced";
import { helpCommands } from "./commands/help";

const registry = new CommandRegistry();
const basicCommands = new BasicCommands();
const filesystemCommands = new FilesystemCommands();
const systemCommands = new SystemCommands();

registry.registerCommands(basicCommands.getCommands());
registry.registerCommands(filesystemCommands.getCommands());
registry.registerCommands(systemCommands.getCommands());

const gitUtils = new GitUtils();
const pathUtils = new PathUtils();
const tabCompleter = new TabCompleter(registry);

const terminal = new Terminal({
  registry,
  utilities: {
    git: gitUtils,
    path: pathUtils,
    tabCompleter
  },
  presentation: {
    mode: "default",
    colors: true,
    maxWidth: 120,
    maxTableRows: 50,
    showTimestamps: false,
  }
});

terminal.registerCustomCommands(enhancedCommands);
terminal.registerCustomCommands(helpCommands);

terminal.start();
