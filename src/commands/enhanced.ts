import * as fs from "fs/promises";
import * as path from "path";
import type { CommandDefinition, CommandOutput, TreeNode } from "../types";
import { defineCommand } from "../core/customCommands";
import { Output, withTitle } from "../core/output";
import { createStep, createPlan, emitEvent } from "../core/pipeline";

export const enhancedLs: CommandDefinition = defineCommand("lsx")
  .aliases("dir", "list")
  .description("List directory contents with rich output")
  .usage("lsx [path] [--tree] [--long] [--all]")
  .category("filesystem")
  .pathParam("path", "Directory to list", { default: "." })
  .boolFlag("tree", "Display as tree structure", "t")
  .boolFlag("long", "Show detailed information", "l")
  .boolFlag("all", "Include hidden files", "a")
  .boolFlag("json", "Output as JSON", "j")
  .onIntent((input) => ({
    action: "list",
    targets: [input.parameters.path || "."],
    options: {
      tree: input.flags.tree || false,
      long: input.flags.long || false,
      all: input.flags.all || false,
      json: input.flags.json || false,
    },
  }))
  .onValidate(async (intent, context) => {
    const targetPath = path.resolve(context.currentDir, intent.targets[0]);
    try {
      const stat = await fs.stat(targetPath);
      if (!stat.isDirectory()) {
        return { valid: false, error: `'${intent.targets[0]}' is not a directory` };
      }
      return { valid: true };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return { valid: false, error: `Directory not found: ${intent.targets[0]}` };
      }
      return { valid: false, error: (err as Error).message };
    }
  })
  .onPlan((intent, context) => {
    return createPlan([
      createStep("read-dir", "readdir", "Read directory contents", {
        path: path.resolve(context.currentDir, intent.targets[0]),
        ...intent.options,
      }),
    ]);
  })
  .onExecute(async (plan, context) => {
    const step = plan.steps[0];
    const targetPath = step.params.path;
    const { tree, long, all } = step.params;
    
    emitEvent(context, "info", `Reading directory: ${targetPath}`);
    
    const items = await fs.readdir(targetPath, { withFileTypes: true });
    const filteredItems = all ? items : items.filter((item) => !item.name.startsWith("."));
    
    if (filteredItems.length === 0) {
      return Output.text("(empty directory)");
    }
    
    if (tree) {
      const treeNode = await buildTreeNode(targetPath, filteredItems, all);
      return withTitle(Output.tree(treeNode), `Directory: ${targetPath}`);
    }
    
    if (long) {
      const rows: any[][] = [];
      for (const item of filteredItems) {
        const itemPath = path.join(targetPath, item.name);
        try {
          const stat = await fs.stat(itemPath);
          rows.push([
            item.isDirectory() ? "d" : "-",
            formatPermissions(stat.mode),
            stat.size,
            stat.mtime.toLocaleDateString(),
            item.name,
          ]);
        } catch {
          rows.push(["?", "?", "?", "?", item.name]);
        }
      }
      return Output.table(["Type", "Permissions", "Size", "Modified", "Name"], rows);
    }
    
    const sorted = filteredItems.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });
    
    const maxLen = Math.max(...sorted.map(i => i.name.length)) + 3;
    const cols = Math.max(1, Math.floor(80 / maxLen));
    const lines: string[] = [];
    
    for (let i = 0; i < sorted.length; i += cols) {
      const row = sorted.slice(i, i + cols).map(item => {
        const isDir = item.isDirectory();
        const name = isDir ? `${item.name}/` : item.name;
        const padded = name.padEnd(maxLen);
        return isDir ? `\x1b[1;34m${padded}\x1b[0m` : padded;
      });
      lines.push(row.join(""));
    }
    
    return Output.text(lines.join("\n"));
  })
  .build();

async function buildTreeNode(
  dirPath: string,
  items: any[],
  showHidden: boolean,
  depth: number = 0,
  maxDepth: number = 3
): Promise<TreeNode> {
  const children: TreeNode[] = [];
  
  for (const item of items) {
    const node: TreeNode = {
      name: item.name,
      type: item.isDirectory() ? "directory" : "file",
    };
    
    if (item.isDirectory() && depth < maxDepth) {
      const subPath = path.join(dirPath, item.name);
      try {
        const subItems = await fs.readdir(subPath, { withFileTypes: true });
        const filtered = showHidden ? subItems : subItems.filter((i) => !i.name.startsWith("."));
        node.children = (await Promise.all(
          filtered.map((subItem) => buildTreeNode(subPath, [subItem], showHidden, depth + 1, maxDepth))
        )).map((n) => n.children?.[0] || n);
      } catch {}
    }
    
    children.push(node);
  }
  
  return { name: path.basename(dirPath) || dirPath, type: "directory", children };
}

function formatPermissions(mode: number): string {
  const perms = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
  const owner = perms[(mode >> 6) & 7];
  const group = perms[(mode >> 3) & 7];
  const other = perms[mode & 7];
  return owner + group + other;
}

export const fileInfo: CommandDefinition = defineCommand("info")
  .description("Show detailed file or directory information")
  .usage("info <path>")
  .category("filesystem")
  .pathParam("path", "File or directory path", { required: true })
  .onExecute(async (plan, context) => {
    const targetPath = path.resolve(context.currentDir, plan.steps[0].params.targets?.[0] || "");
    
    try {
      const stat = await fs.stat(targetPath);
      const pairs = [
        { key: "Path", value: targetPath },
        { key: "Type", value: stat.isDirectory() ? "Directory" : stat.isFile() ? "File" : "Other" },
        { key: "Size", value: stat.size, format: "bytes" },
        { key: "Created", value: stat.birthtime, format: "date" },
        { key: "Modified", value: stat.mtime, format: "date" },
        { key: "Accessed", value: stat.atime, format: "date" },
        { key: "Permissions", value: formatPermissions(stat.mode) },
        { key: "Is Symbolic Link", value: stat.isSymbolicLink() },
      ];
      return withTitle(Output.keyValue(pairs), `File Information`);
    } catch (err) {
      return Output.error(`Cannot access '${targetPath}'`, { code: (err as NodeJS.ErrnoException).code });
    }
  })
  .build();

export const envInfo: CommandDefinition = defineCommand("env")
  .description("Show environment information")
  .usage("env [--all]")
  .category("system")
  .boolFlag("all", "Show all environment variables", "a")
  .onExecute(async (plan, context) => {
    const showAll = plan.steps[0].params.all;
    
    if (showAll) {
      const pairs = Object.entries(process.env)
        .filter(([key, value]) => value !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => ({ key, value: value || "" }));
      return Output.keyValue(pairs);
    }
    
    return Output.keyValue([
      { key: "Node Version", value: process.version },
      { key: "Platform", value: process.platform },
      { key: "Architecture", value: process.arch },
      { key: "Working Directory", value: context.currentDir },
      { key: "Home Directory", value: context.homeDir },
      { key: "Shell", value: process.env.SHELL || "unknown" },
      { key: "User", value: process.env.USER || process.env.USERNAME || "unknown" },
      { key: "Terminal", value: process.env.TERM || "unknown" },
    ]);
  })
  .build();

export const search: CommandDefinition = defineCommand("search")
  .aliases("find", "grep")
  .description("Search for files or content")
  .usage("search <pattern> [--type <file|content>] [--path <dir>]")
  .category("filesystem")
  .stringParam("pattern", "Search pattern", { required: true })
  .choiceParam("type", "Search type", ["file", "content"], { default: "file" })
  .pathParam("path", "Directory to search in", { default: "." })
  .boolFlag("recursive", "Search recursively", "r")
  .onValidate(async (intent) => {
    if (!intent.targets[0]) {
      return { valid: false, error: "Search pattern is required" };
    }
    return { valid: true };
  })
  .onExecute(async (plan, context) => {
    const { pattern, type, path: searchPath, recursive } = plan.steps[0].params;
    const fullPath = path.resolve(context.currentDir, searchPath || ".");
    const results: { path: string; type: string }[] = [];
    
    async function searchDir(dir: string, depth: number = 0) {
      if (!recursive && depth > 0) return;
      
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
          if (item.name.startsWith(".")) continue;
          
          const itemPath = path.join(dir, item.name);
          const relativePath = path.relative(fullPath, itemPath);
          
          if (type === "file" && item.name.toLowerCase().includes(pattern.toLowerCase())) {
            results.push({ path: relativePath, type: item.isDirectory() ? "directory" : "file" });
          }
          
          if (item.isDirectory()) {
            await searchDir(itemPath, depth + 1);
          }
        }
      } catch {}
    }
    
    await searchDir(fullPath);
    
    if (results.length === 0) {
      return Output.info(`No matches found for '${pattern}'`);
    }
    
    return withTitle(Output.table(["Path", "Type"], results.map((r) => [r.path, r.type])), `Search Results (${results.length} matches)`);
  })
  .build();

export const diskUsage: CommandDefinition = defineCommand("du")
  .description("Show disk usage for directory")
  .usage("du [path]")
  .category("filesystem")
  .pathParam("path", "Directory to analyze", { default: "." })
  .onExecute(async (plan, context) => {
    const targetPath = path.resolve(context.currentDir, plan.steps[0].params.path || ".");
    
    async function calculateSize(dir: string): Promise<{ name: string; size: number }[]> {
      const results: { name: string; size: number }[] = [];
      
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
          if (item.name.startsWith(".")) continue;
          
          const itemPath = path.join(dir, item.name);
          
          if (item.isDirectory()) {
            const subResults = await calculateSize(itemPath);
            const totalSize = subResults.reduce((sum, r) => sum + r.size, 0);
            results.push({ name: item.name, size: totalSize });
          } else {
            const stat = await fs.stat(itemPath);
            results.push({ name: item.name, size: stat.size });
          }
        }
      } catch {}
      
      return results.sort((a, b) => b.size - a.size);
    }
    
    const results = await calculateSize(targetPath);
    
    if (results.length === 0) {
      return Output.text("(empty directory)");
    }
    
    function formatSize(bytes: number): string {
      const units = ["B", "KB", "MB", "GB"];
      let size = bytes;
      let unit = 0;
      while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit++;
      }
      return `${size.toFixed(1)} ${units[unit]}`;
    }
    
    const total = results.reduce((sum, r) => sum + r.size, 0);
    
    return Output.composite(
      Output.table(["Name", "Size"], results.slice(0, 20).map((r) => [r.name, formatSize(r.size)])),
      Output.keyValue([
        { key: "Total", value: formatSize(total) },
        { key: "Items", value: results.length },
      ])
    );
  })
  .build();

export const enhancedCommands: CommandDefinition[] = [
  enhancedLs,
  fileInfo,
  envInfo,
  search,
  diskUsage,
];
