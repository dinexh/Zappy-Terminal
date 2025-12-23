# 🚀 Zappy Terminal

A modern, modular terminal implementation built with TypeScript and Bun.

## Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules for commands, utilities, and core functionality
- **Command System**: Extensible command registry with support for aliases
- **Tab Completion**: Smart tab completion for commands and files
- **Git Integration**: Git branch and status display in prompt
- **File Operations**: Comprehensive file and directory management
- **System Commands**: Execute system commands with fallback support

## Architecture

The codebase is organized into the following modules:

```
src/
├── commands/           # Command implementations
│   ├── basic.ts       # Basic commands (hi, help, clear, pwd)
│   ├── filesystem.ts  # File operations (ls, cd, mkdir, rm, etc.)
│   ├── system.ts      # System commands (git, exit)
│   └── index.ts       # Command registry
├── core/
│   └── terminal.ts    # Core terminal functionality
├── types/
│   └── index.ts       # TypeScript type definitions
├── utils/             # Utility functions
│   ├── git.ts        # Git utilities
│   ├── path.ts       # Path utilities
│   └── tabCompleter.ts # Tab completion logic
└── main.ts            # Alternative entry point
```

## Installation

1. Install dependencies:
   ```bash
   bun install
   ```

2. Install Node.js type definitions:
   ```bash
   npm install --save-dev @types/node
   ```

## Usage

### Run the Terminal

```bash
# Primary entry point (recommended)
bun run index.ts

# Alternative entry point
bun run src/main.ts
```

### Available Commands

#### Basic Commands
- `hi` - Say hello
- `what` - What can I do?
- `help` - Show available commands
- `clear` - Clear the screen
- `pwd` - Show current directory

#### File & Directory Commands
- `ls` - List files in current directory
- `cd <dir>` - Change directory
- `mkdir <dir>` - Create a directory
- `touch <file>` - Create an empty file
- `rm <file>` - Delete a file
- `rm -rf <dir>` - Delete a directory recursively
- `rmdir <dir>` - Delete an empty directory
- `mv <src> <dst>` - Move or rename file/folder
- `cat <file>` - View file content

#### System Commands
- `git <...>` - Run git commands
- `exit` / `bye` - Exit the terminal

## Development

### Building

```bash
# Type check
npx tsc --noEmit

# Build (if needed)
bun build index.ts
```

### Project Structure

The modular design allows for easy extension:

1. **Adding Commands**: Implement the `Command` interface and register with `CommandRegistry`
2. **Adding Utilities**: Create utility classes and inject them into the terminal configuration
3. **Custom Tab Completion**: Extend the `TabCompleter` class

### Key Interfaces

```typescript
interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  handler: (args: string[], context: CommandContext) => Promise<void> | void;
}

interface CommandContext {
  currentDir: string;
  homeDir: string;
  prompt: () => void;
  exit: () => void;
}
```

## License

MIT License - see LICENSE file for details.

---

**Zappy Terminal** - Making command-line interactions more enjoyable! ✨
