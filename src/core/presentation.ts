import type {
  CommandOutput,
  PresentationConfig,
  PresentationContext,
  PresentationMode,
  TableOutput,
  ListOutput,
  TreeOutput,
  TreeNode,
  KeyValueOutput,
  ProgressOutput,
  ErrorOutput,
  SuccessOutput,
  ListItem,
} from "../types";

const Colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

function colorize(text: string, ...codes: string[]): string {
  return `${codes.join("")}${text}${Colors.reset}`;
}

function bold(text: string): string {
  return colorize(text, Colors.bold);
}

function dim(text: string): string {
  return colorize(text, Colors.dim);
}

function success(text: string): string {
  return colorize(text, Colors.green);
}

function error(text: string): string {
  return colorize(text, Colors.red);
}

function warning(text: string): string {
  return colorize(text, Colors.yellow);
}

function info(text: string): string {
  return colorize(text, Colors.cyan);
}

const defaultConfig: PresentationConfig = {
  mode: "default",
  colors: true,
  maxWidth: 120,
  maxTableRows: 50,
  truncateStrings: 100,
  showTimestamps: false,
  jsonPrettyPrint: true,
};

export class PresentationLayer implements PresentationContext {
  config: PresentationConfig;
  
  constructor(config: Partial<PresentationConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
  
  setMode(mode: PresentationMode): void {
    this.config.mode = mode;
  }
  
  getMode(): PresentationMode {
    return this.config.mode;
  }
  
  render(output: CommandOutput): void {
    if (this.config.mode === "json") {
      this.renderAsJson(output);
      return;
    }
    
    if (output.metadata?.title) {
      console.log(bold(output.metadata.title));
      if (output.metadata.description) {
        console.log(dim(output.metadata.description));
      }
      console.log();
    }
    
    switch (output.type) {
      case "text":
        this.renderText(output.data);
        break;
      case "table":
        this.renderTable(output as TableOutput);
        break;
      case "list":
        this.renderList(output as ListOutput);
        break;
      case "tree":
        this.renderTree(output as TreeOutput);
        break;
      case "keyValue":
        this.renderKeyValue(output as KeyValueOutput);
        break;
      case "progress":
        this.renderProgress(output as ProgressOutput);
        break;
      case "error":
        this.renderError(output as ErrorOutput);
        break;
      case "success":
        this.renderSuccess(output as SuccessOutput);
        break;
      case "warning":
        this.renderWarning(output.data);
        break;
      case "info":
        this.renderInfo(output.data);
        break;
      case "diff":
        this.renderDiff(output.data);
        break;
      case "composite":
        this.renderComposite(output);
        break;
      default:
        console.log(JSON.stringify(output.data, null, 2));
    }
    
    if (this.config.mode === "detailed" && output.metadata?.duration) {
      console.log(dim(`\nCompleted in ${output.metadata.duration}ms`));
    }
  }
  
  private renderAsJson(output: CommandOutput): void {
    const jsonOutput = this.config.jsonPrettyPrint
      ? JSON.stringify(output, null, 2)
      : JSON.stringify(output);
    console.log(jsonOutput);
  }
  
  private renderText(text: string): void {
    console.log(text);
  }
  
  private renderTable(output: TableOutput): void {
    const { headers, rows, alignment } = output.data;
    
    if (rows.length === 0) {
      console.log(dim("(no data)"));
      return;
    }
    
    const colWidths = headers.map((h, i) => {
      const maxDataWidth = Math.max(...rows.map((r) => String(r[i] ?? "").length));
      return Math.max(h.length, maxDataWidth);
    });
    
    const maxWidth = this.config.maxWidth || 120;
    const totalWidth = colWidths.reduce((a, b) => a + b, 0) + (colWidths.length - 1) * 3;
    
    if (totalWidth > maxWidth) {
      const scale = maxWidth / totalWidth;
      colWidths.forEach((w, i) => {
        colWidths[i] = Math.max(5, Math.floor(w * scale));
      });
    }
    
    const headerLine = headers
      .map((h, i) => this.padCell(h, colWidths[i], alignment?.[i] || "left"))
      .join(" | ");
    console.log(bold(headerLine));
    
    const separator = colWidths.map((w) => "-".repeat(w)).join("-+-");
    console.log(dim(separator));
    
    const displayRows = rows.slice(0, this.config.maxTableRows);
    displayRows.forEach((row) => {
      const rowLine = row
        .map((cell, i) => this.padCell(String(cell ?? ""), colWidths[i], alignment?.[i] || "left"))
        .join(" | ");
      console.log(rowLine);
    });
    
    if (rows.length > displayRows.length) {
      console.log(dim(`\n... and ${rows.length - displayRows.length} more rows`));
    }
  }
  
  private padCell(text: string, width: number, align: "left" | "center" | "right"): string {
    const truncated = text.length > width ? text.slice(0, width - 2) + ".." : text;
    const padding = width - truncated.length;
    
    switch (align) {
      case "right":
        return " ".repeat(padding) + truncated;
      case "center":
        const left = Math.floor(padding / 2);
        const right = padding - left;
        return " ".repeat(left) + truncated + " ".repeat(right);
      default:
        return truncated + " ".repeat(padding);
    }
  }
  
  private renderList(output: ListOutput): void {
    const { items, ordered, style } = output.data;
    
    if (items.length === 0) {
      console.log(dim("(empty list)"));
      return;
    }
    
    const bullets: Record<string, string> = {
      bullet: "*",
      dash: "-",
      arrow: ">",
      check: "+",
      number: "",
    };
    
    const bullet = bullets[style || "bullet"];
    
    items.forEach((item, index) => {
      const prefix = ordered ? `${index + 1}.` : bullet;
      this.renderListItem(item, prefix, 0);
    });
  }
  
  private renderListItem(item: ListItem, prefix: string, depth: number): void {
    const indent = "  ".repeat(depth);
    let content = item.content;
    
    if (item.color) {
      const colorCode = (Colors as any)[item.color] || "";
      content = colorize(content, colorCode);
    }
    
    const icon = item.icon ? `${item.icon} ` : "";
    
    console.log(`${indent}${prefix} ${icon}${content}`);
    
    if (item.children) {
      item.children.forEach((child) => {
        this.renderListItem(child, "*", depth + 1);
      });
    }
  }
  
  private renderTree(output: TreeOutput): void {
    this.renderTreeNode(output.data, "", true);
  }
  
  private renderTreeNode(node: TreeNode, prefix: string, isLast: boolean): void {
    const connector = isLast ? "+-- " : "|-- ";
    const icon = node.type === "directory" ? "[D] " : node.type === "file" ? "[F] " : "";
    const name = node.type === "directory" ? colorize(node.name, Colors.blue, Colors.bold) : node.name;
    
    console.log(`${prefix}${connector}${icon}${name}`);
    
    if (node.children) {
      const newPrefix = prefix + (isLast ? "    " : "|   ");
      node.children.forEach((child, index) => {
        const childIsLast = index === node.children!.length - 1;
        this.renderTreeNode(child, newPrefix, childIsLast);
      });
    }
  }
  
  private renderKeyValue(output: KeyValueOutput): void {
    const { pairs, separator = ":" } = output.data;
    
    if (pairs.length === 0) {
      console.log(dim("(no data)"));
      return;
    }
    
    const maxKeyLen = Math.max(...pairs.map((p) => p.key.length));
    
    pairs.forEach(({ key, value, format }) => {
      const paddedKey = key.padEnd(maxKeyLen);
      let displayValue = this.formatValue(value, format);
      console.log(`${bold(paddedKey)}${separator} ${displayValue}`);
    });
  }
  
  private formatValue(value: any, format?: string): string {
    if (value === null || value === undefined) {
      return dim("(none)");
    }
    
    if (format === "bytes") {
      return this.formatBytes(value);
    }
    
    if (format === "date") {
      return new Date(value).toLocaleString();
    }
    
    if (format === "duration") {
      return `${value}ms`;
    }
    
    if (typeof value === "boolean") {
      return value ? success("yes") : error("no");
    }
    
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    
    return String(value);
  }
  
  private formatBytes(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    let size = bytes;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
  
  private renderProgress(output: ProgressOutput): void {
    const { current, total, message, unit } = output.data;
    const percentage = Math.round((current / total) * 100);
    const barWidth = 30;
    const filled = Math.round((current / total) * barWidth);
    const empty = barWidth - filled;
    
    const bar = success("#".repeat(filled)) + dim(".".repeat(empty));
    const status = `${current}/${total}${unit ? ` ${unit}` : ""}`;
    const msg = message ? ` ${message}` : "";
    
    console.log(`[${bar}] ${percentage}% ${status}${msg}`);
  }
  
  private renderError(output: ErrorOutput): void {
    const { message, code, details, suggestions, stack } = output.data;
    
    console.log(error(`[ERROR]${code ? ` [${code}]` : ""}: ${message}`));
    
    if (details && this.config.mode !== "minimal") {
      console.log(dim(details));
    }
    
    if (suggestions && suggestions.length > 0 && this.config.mode !== "minimal") {
      console.log(info("\nSuggestions:"));
      suggestions.forEach((s) => console.log(`  * ${s}`));
    }
    
    if (stack && this.config.mode === "detailed") {
      console.log(dim("\nStack trace:"));
      console.log(dim(stack));
    }
  }
  
  private renderSuccess(output: SuccessOutput): void {
    const { message, details } = output.data;
    console.log(success(`[OK] ${message}`));
    if (details && this.config.mode !== "minimal") {
      console.log(dim(details));
    }
  }
  
  private renderWarning(data: { message: string }): void {
    console.log(warning(`[WARN] ${data.message}`));
  }
  
  private renderInfo(data: { message: string }): void {
    console.log(info(`[INFO] ${data.message}`));
  }
  
  private renderDiff(data: { before: string; after: string; context?: number }): void {
    const beforeLines = data.before.split("\n");
    const afterLines = data.after.split("\n");
    
    console.log(dim("--- before"));
    console.log(dim("+++ after"));
    console.log();
    
    const maxLines = Math.max(beforeLines.length, afterLines.length);
    for (let i = 0; i < maxLines; i++) {
      const before = beforeLines[i];
      const after = afterLines[i];
      
      if (before === after) {
        console.log(`  ${before || ""}`);
      } else {
        if (before !== undefined) {
          console.log(error(`- ${before}`));
        }
        if (after !== undefined) {
          console.log(success(`+ ${after}`));
        }
      }
    }
  }
  
  private renderComposite(output: CommandOutput): void {
    if (!output.children || output.children.length === 0) {
      return;
    }
    
    output.children.forEach((child, index) => {
      if (index > 0) {
        console.log();
      }
      this.render(child);
    });
  }
}

export function createPresentationContext(config: Partial<PresentationConfig> = {}): PresentationContext {
  return new PresentationLayer(config);
}

export const defaultPresentation = new PresentationLayer();
