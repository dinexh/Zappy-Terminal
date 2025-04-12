import * as readline from "readline";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import { exec } from "child_process";

let currentDir = process.cwd();
const homeDir = process.env.HOME || process.env.USERPROFILE;

function formatDir(dir: string) {
  return dir.startsWith(homeDir!) ? dir.replace(homeDir!, "~") : dir;
}

function getGitBranch(): string | null {
  const gitHeadPath = path.join(currentDir, ".git", "HEAD");
  try {
    const content = fsSync.readFileSync(gitHeadPath, "utf-8").trim();
    const match = content.match(/ref: refs\/heads\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function tabCompleter(line: string) {
  const allCommands = [
    "hi", "what", "help", "bye", "exit", "mkdir", "touch",
    "rm", "rmdir", "mv", "ls", "cd", "pwd", "cat", "clear", "git"
  ];

  const words = line.trim().split(" ");
  const [cmd, ...rest] = words;

  if (words.length === 1) {
    const hits = allCommands.filter(c => c.startsWith(cmd));
    return [hits.length ? hits : allCommands, cmd];
  }

  if (["cd", "touch", "rm", "rmdir", "mv", "cat"].includes(cmd)) {
    const input = rest[rest.length - 1] || "";
    try {
      const files = fsSync.readdirSync(currentDir);
      const suggestions = files.filter(f => f.startsWith(input));
      return [suggestions.length ? suggestions : files, input];
    } catch {
      return [[], input];
    }
  }

  return [[], line];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: tabCompleter
});

async function runCommand(input: string) {
  const args = input.trim().split(" ");
  const command = args[0];
  const target = args[1];

  switch (command) {
    case "hi":
      console.log("hello");
      break;

    case "what":
      console.log("I can say hi, help you, and manage files/folders!");
      break;

    case "help":
      console.log(`
Available Commands:
  hi             → Say hello
  what           → What can I do?
  help           → List all commands
  bye / exit     → Exit the terminal
  mkdir <dir>    → Create a directory
  touch <file>   → Create an empty file
  rm <file>      → Delete a file
  rm -rf <dir>   → Delete a directory recursively
  rmdir <dir>    → Delete an empty directory
  mv <src> <dst> → Rename or move file/folder
  ls             → List files in current directory
  cd <dir>       → Change directory
  pwd            → Show full path of current directory
  cat <file>     → View file content
  clear          → Clear the screen
  git <command>  → Run git commands
      `);
      break;

    case "mkdir":
      if (!target) return console.log("Usage: mkdir <dir-name>");
      await fs.mkdir(path.join(currentDir, target))
        .then(() => console.log(`Created directory: ${target}`))
        .catch((err) => console.log("Error:", err.message));
      break;

    case "touch":
      if (!target) return console.log("Usage: touch <file-name>");
      await fs.writeFile(path.join(currentDir, target), "")
        .then(() => console.log(`Created file: ${target}`))
        .catch((err) => console.log("Error:", err.message));
      break;

    case "rm":
      if (!target) return console.log("Usage: rm <file-name> or rm -rf <dir>");
      if (target === "-rf") {
        const dir = args[2];
        if (!dir) return console.log("Usage: rm -rf <dir>");
        await fs.rm(path.join(currentDir, dir), { recursive: true, force: true })
          .then(() => console.log(`Recursively removed: ${dir}`))
          .catch((err) => console.log("Error:", err.message));
      } else {
        await fs.unlink(path.join(currentDir, target))
          .then(() => console.log(`Deleted file: ${target}`))
          .catch((err) => console.log("Error:", err.message));
      }
      break;

    case "rmdir":
      if (!target) return console.log("Usage: rmdir <dir-name>");
      await fs.rmdir(path.join(currentDir, target))
        .then(() => console.log(`Removed directory: ${target}`))
        .catch((err) => console.log("Error:", err.message));
      break;

    case "mv":
      const source = args[1];
      const dest = args[2];
      if (!source || !dest) return console.log("Usage: mv <source> <destination>");
      await fs.rename(path.join(currentDir, source), path.join(currentDir, dest))
        .then(() => console.log(`Moved/Renamed: ${source} → ${dest}`))
        .catch((err) => console.log("Error:", err.message));
      break;

    case "ls":
      try {
        const items = await fs.readdir(currentDir, { withFileTypes: true });
        for (const item of items) {
          const isDir = item.isDirectory();
          console.log(isDir ? `\x1b[34m[DIR]\x1b[0m  ${item.name}` : `       ${item.name}`);
        }
      } catch (err: any) {
        console.log("Error reading directory:", err.message);
      }
      break;

    case "cd":
      if (!target) return console.log("Usage: cd <dir-name>");
      const newPath = path.resolve(currentDir, target);
      try {
        const stat = await fs.stat(newPath);
        if (stat.isDirectory()) {
          currentDir = newPath;
        } else {
          console.log("Not a directory.");
        }
      } catch (err: any) {
        console.log("Directory not found:", err.message);
      }
      break;

    case "pwd":
      console.log(currentDir);
      break;

    case "cat":
      if (!target) return console.log("Usage: cat <file>");
      try {
        const data = await fs.readFile(path.join(currentDir, target), "utf8");
        console.log(data);
      } catch (err: any) {
        console.log("Error reading file:", err.message);
      }
      break;

    case "clear":
      console.clear();
      break;

    case "git":
      const gitArgs = args.slice(1).join(" ");
      exec(`git ${gitArgs}`, { cwd: currentDir }, (err, stdout, stderr) => {
        if (err) {
          console.log(stderr.trim());
        } else {
          console.log(stdout.trim());
        }
      });
      break;

    case "bye":
    case "exit":
      console.log("See ya!");
      rl.close();
      return;

    default:
      console.log("Unknown command. Type 'help' for options.");
      break;
  }
}

function ask() {
  const branch = getGitBranch();
  const dirDisplay = formatDir(currentDir);
  rl.question(`\x1b[1m\x1b[35mzappy${branch ? ` (${branch})` : ""} ${dirDisplay}\x1b[0m> `, async (input: string) => {
    await runCommand(input);
    if (!["exit", "bye"].includes(input.trim().toLowerCase())) {
      ask();
    }
  });
}

console.log("Hey there! I'm Zappy, your friendly terminal!");
ask();
