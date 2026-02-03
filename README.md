# ShellX Terminal

A modern, modular terminal with custom commands, layered architecture, multi-modal output, and intelligent presentation.

## Architecture

```
                    ShellX Terminal Architecture
    
    +----------------------------------------------------------+
    |                      User Input                           |
    +----------------------------------------------------------+
                              |
                              v
    +----------------------------------------------------------+
    |                   Command Pipeline                        |
    |  +----------+  +----------+  +--------+  +---------+     |
    |  |  Intent  |->| Validate |->|  Plan  |->| Execute |     |
    |  +----------+  +----------+  +--------+  +---------+     |
    +----------------------------------------------------------+
                              |
                              v
    +----------------------------------------------------------+
    |                 Multi-Modal Output                        |
    |   Text | Table | List | Tree | KeyValue | Progress       |
    |   Success | Error | Warning | Info | Diff | Composite    |
    +----------------------------------------------------------+
                              |
                              v
    +----------------------------------------------------------+
    |                 Presentation Layer                        |
    |     default | compact | detailed | json | minimal        |
    +----------------------------------------------------------+
```

## Features

- **Custom Commands**: Fully customizable commands with parameters, flags, validation
- **Layer Architecture**: 5-stage pipeline (Intent, Validate, Plan, Execute, Present)
- **Multi-Modal Output**: 12+ output types (tables, trees, lists, progress, etc.)
- **Smart Presentation**: 5 display modes with automatic formatting
- **Composable**: Chain commands and build workflows
- **Self-Documenting**: Auto-generated help from command definitions

## Setup

### Phoenix Backend

```bash
cd backend
mix deps.get
mix ecto.create
mix phx.server
```

Run tests:

```bash
cd backend
mix test
```

### Web Documentation

```bash
cd web
npm install
npm start
```

## Commands

### Basic
- `hi` - Say hello
- `help` - Show help
- `clear` - Clear screen
- `pwd` - Current directory

### Enhanced
- `lsx [path] [--tree] [--long]` - Rich directory listing
- `info <path>` - File information
- `search <pattern> [-r]` - Search files
- `du [path]` - Disk usage
- `env [--all]` - Environment info

### Files
- `ls` - List files
- `cd <dir>` - Change directory
- `mkdir <name>` - Create directory
- `touch <file>` - Create file
- `rm <file>` / `rm -rf <dir>` - Remove
- `mv <src> <dst>` - Move/rename
- `cat <file>` - View file

### System
- `git <command>` - Git commands
- `exit` - Exit terminal
- `:mode <mode>` - Switch presentation mode

## Presentation Modes

Switch modes at runtime with `:mode <name>`:

- `default` - Standard formatting with colors
- `compact` - Reduced whitespace
- `detailed` - Full details with timing
- `json` - Raw JSON output
- `minimal` - Essential only

## License

MIT
