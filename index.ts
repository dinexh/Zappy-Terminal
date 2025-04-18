import * as readline from "readline";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import { exec, execSync } from "child_process";

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

function getGitStatus(): string {
  try {
    const commandOutput = execSync("git status --porcelain", {
      cwd: currentDir,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    const result = commandOutput ? " ✗" : "";
    return result;
  } catch (error: any) {

    return "";
  }
}

function tabCompleter(line: string) {
  const allCommands = [
    "hi",
    "what",
    "help",
    "bye",
    "exit",
    "mkdir",
    "touch",
    "rm",
    "rmdir",
    "mv",
    "ls",
    "cd",
    "pwd",
    "cat",
    "clear",
    "git",
  ];

  const words = line.trim().split(" ");
  const [cmd, ...rest] = words;

  if (words.length === 1) {
    const hits = allCommands.filter((c) => c.startsWith(cmd));
    return [hits.length ? hits : allCommands, cmd];
  }

  if (["cd", "touch", "rm", "rmdir", "mv", "cat"].includes(cmd)) {
    const input = rest[rest.length - 1] || "";
    try {
      const files = fsSync.readdirSync(currentDir);
      const suggestions = files.filter((f) => f.startsWith(input));
      return [suggestions.length ? suggestions : files, input];
    } catch {
      return [[], input];
    }
  }

  if (cmd === "git" && rest.length >= 1) {
    const gitSubCommands = [
      "add",
      "status",
      "commit",
      "push",
      "pull",
      "branch",
      "checkout",
      "log",
      "diff",
    ];
    const currentGitArg = rest[rest.length - 1];
    const hits = gitSubCommands.filter((c) => c.startsWith(currentGitArg));
    return [hits.length ? hits : gitSubCommands, currentGitArg];
  }

  return [[], line];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: tabCompleter,
});

async function runCommand(input: string) {
  const args = input.trim().split(" ");
  const command = args[0];
  const target = args[1];

  if (!command) {
    ask();
    return;
  }

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
  hi           → Say hello
  what         → What can I do?
  help         → List all commands
  bye / exit   → Exit the terminal
  mkdir <dir>  → Create a directory
  touch <file> → Create an empty file
  rm <file>    → Delete a file
  rm -rf <dir> → Delete a directory recursively
  rmdir <dir>  → Delete an empty directory
  mv <src> <dst> → Rename or move file/folder
  ls           → List files in current directory
  cd <dir>     → Change directory
  pwd          → Show full path of current directory
  cat <file>   → View file content
  clear        → Clear the screen
  git <...>    → Run git commands (delegated)
      `);
      break;

    case "mkdir":
      if (!target) return console.log("Usage: mkdir <dir-name>");
      await fs
        .mkdir(path.join(currentDir, target))
        .then(() => console.log(`Created directory: ${target}`))
        .catch((err: any) => console.log("Error:", err.message));
      break;

    case "touch":
      if (!target) return console.log("Usage: touch <file-name>");
      await fs
        .writeFile(path.join(currentDir, target), "")
        .then(() => console.log(`Created file: ${target}`))
        .catch((err: any) => console.log("Error:", err.message));
      break;

    case "rm":
      if (!target) return console.log("Usage: rm <file-name> or rm -rf <dir>");
      if (target === "-rf") {
        const dir = args[2];
        if (!dir) return console.log("Usage: rm -rf <dir>");
        await fs
          .rm(path.join(currentDir, dir), { recursive: true, force: true })
          .then(() => console.log(`Recursively removed: ${dir}`))
          .catch((err: any) => console.log("Error:", err.message));
      } else {
        try {
          const stats = await fs.stat(path.join(currentDir, target));
          if (stats.isDirectory()) {
            console.log(
              `Error: '${target}' is a directory. Use 'rm -rf' or 'rmdir'.`
            );
          } else {
            await fs.unlink(path.join(currentDir, target));
            console.log(`Deleted file: ${target}`);
          }
        } catch (err: any) {
          console.log("Error:", err.message);
        }
      }
      break;

    case "rmdir":
      if (!target) return console.log("Usage: rmdir <dir-name>");
      await fs
        .rmdir(path.join(currentDir, target))
        .then(() => console.log(`Removed directory: ${target}`))
        .catch((err: any) => console.log("Error:", err.message));
      break;

    case "mv":
      const source = args[1];
      const dest = args[2];
      if (!source || !dest)
        return console.log("Usage: mv <source> <destination>");
      await fs
        .rename(path.join(currentDir, source), path.join(currentDir, dest))
        .then(() => console.log(`Moved/Renamed: ${source} → ${dest}`))
        .catch((err: any) => console.log("Error:", err.message));
      break;

    case "ls":
      try {
        const items = await fs.readdir(currentDir, { withFileTypes: true });
        if (items.length === 0) {
          console.log("(empty directory)");
        } else {
          items.forEach((item) => {
            const isDir = item.isDirectory();
            console.log(isDir ? `\x1b[1;34m${item.name}\x1b[0m` : item.name);
          });
        }
      } catch (err: any) {
        console.log("Error reading directory:", err.message);
      }
      break;

    case "cd":
      let dirToChange = target;
      if (!dirToChange) {
        dirToChange = homeDir || ".";
      } else if (dirToChange === "~") {
        dirToChange = homeDir || ".";
      }

      const newPath = path.resolve(currentDir, dirToChange);
      try {
        const stat = await fs.stat(newPath);
        if (stat.isDirectory()) {
          currentDir = newPath;
        } else {
          console.log(`cd: Not a directory: ${target}`);
        }
      } catch (err: any) {
        if (err.code === "ENOENT") {
          console.log(`cd: No such file or directory: ${target}`);
        } else {
          console.log("cd Error:", err.message);
        }
      }
      break;

    case "pwd":
      console.log(currentDir);
      break;

    case "cat":
      if (!target) return console.log("Usage: cat <file>");
      try {
        const stats = await fs.stat(path.join(currentDir, target));
        if (stats.isDirectory()) {
          console.log(`cat: ${target}: Is a directory`);
        } else {
          const data = await fs.readFile(path.join(currentDir, target), "utf8");
          console.log(data);
        }
      } catch (err: any) {
        if (err.code === "ENOENT") {
          console.log(`cat: ${target}: No such file or directory`);
        } else {
          console.log("cat Error:", err.message);
        }
      }
      break;

    case "clear":
      console.clear();
      break;

    case "git":
      const gitArgs = args.slice(1).join(" ");
      if (!gitArgs) {
        console.log("Usage: git <command> [options]");
        ask();
        return;
      }
      exec(`git ${gitArgs}`, { cwd: currentDir }, (err, stdout, stderr) => {
        if (err) {
          if (stderr) {
            console.error(stderr.trim());
          } else {
            console.error(`❌ Git Execution Error: ${err.message}`);
          }
        } else {
          if (stdout) {
            console.log(stdout.trim());
          }
          if (stderr) {
            console.error(stderr.trim());
          }
        }
        ask();
      });
      return;

    case "bye":
    case "exit":
      console.log("See ya!");
      rl.close();
      return;

    default:
      exec(
        `${command} ${args.slice(1).join(" ")}`,
        { cwd: currentDir },
        (error, stdout, stderr) => {
          if (error) {
            if (
              error.code === 127 ||
              (process.platform === "win32" &&
                error.message.includes("is not recognized"))
            ) {
              console.log(`Command not found: ${command}`);
            } else {
              if (stderr) {
                console.error(stderr.trim());
              } else {
                console.error(`Exec Error: ${error.message}`);
              }
            }
          } else {
            if (stdout) console.log(stdout.trim());
            if (stderr) console.error(stderr.trim());
          }
          ask();
        },
      );
      return;
  }

  if (!["git", "bye", "exit"].includes(command) && command !== "") {
    ask();
  }
}

function ask() {
  const branch = getGitBranch();
  const gitStatus = getGitStatus();
  const dirDisplay = formatDir(currentDir);

  const prompt = `\x1b[1m\x1b[35mzappy${branch ? ` (${branch})` : ""}${gitStatus} ${dirDisplay}\x1b[0m> `;

  rl.question(prompt, async (input: string) => {
    await runCommand(input.trim());
  });
}

console.log("\nHey there! I'm Zappy, your friendly terminal!");
ask();