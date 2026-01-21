export type OutputType = 
  | "text"
  | "table"
  | "list"
  | "tree"
  | "json"
  | "keyValue"
  | "progress"
  | "diff"
  | "error"
  | "success"
  | "warning"
  | "info"
  | "composite";

export interface OutputMetadata {
  title?: string;
  description?: string;
  timestamp?: number;
  duration?: number;
  source?: string;
  tags?: string[];
}

export interface CommandOutput {
  type: OutputType;
  data: any;
  metadata?: OutputMetadata;
  children?: CommandOutput[];
}

export interface TextOutput extends CommandOutput {
  type: "text";
  data: string;
}

export interface TableOutput extends CommandOutput {
  type: "table";
  data: {
    headers: string[];
    rows: any[][];
    alignment?: ("left" | "center" | "right")[];
  };
}

export interface ListItem {
  content: string;
  icon?: string;
  color?: string;
  children?: ListItem[];
}

export interface ListOutput extends CommandOutput {
  type: "list";
  data: {
    items: ListItem[];
    ordered?: boolean;
    style?: "bullet" | "dash" | "arrow" | "check" | "number";
  };
}

export interface TreeNode {
  name: string;
  type?: "file" | "directory" | "node";
  children?: TreeNode[];
  metadata?: Record<string, any>;
}

export interface TreeOutput extends CommandOutput {
  type: "tree";
  data: TreeNode;
}

export interface KeyValueOutput extends CommandOutput {
  type: "keyValue";
  data: {
    pairs: { key: string; value: any; format?: string }[];
    separator?: string;
  };
}

export interface ProgressOutput extends CommandOutput {
  type: "progress";
  data: {
    current: number;
    total: number;
    message?: string;
    unit?: string;
  };
}

export interface DiffOutput extends CommandOutput {
  type: "diff";
  data: {
    before: string;
    after: string;
    context?: number;
  };
}

export interface ErrorOutput extends CommandOutput {
  type: "error";
  data: {
    message: string;
    code?: string;
    details?: string;
    suggestions?: string[];
    stack?: string;
  };
}

export interface SuccessOutput extends CommandOutput {
  type: "success";
  data: {
    message: string;
    details?: string;
  };
}

export interface CompositeOutput extends CommandOutput {
  type: "composite";
  data: null;
  children: CommandOutput[];
}

export interface OutputBuilder {
  text: (content: string, metadata?: OutputMetadata) => TextOutput;
  table: (headers: string[], rows: any[][], metadata?: OutputMetadata) => TableOutput;
  list: (items: (string | ListItem)[], options?: { ordered?: boolean; style?: ListOutput["data"]["style"] }, metadata?: OutputMetadata) => ListOutput;
  tree: (root: TreeNode, metadata?: OutputMetadata) => TreeOutput;
  keyValue: (pairs: KeyValueOutput["data"]["pairs"], metadata?: OutputMetadata) => KeyValueOutput;
  success: (message: string, details?: string) => SuccessOutput;
  error: (message: string, options?: Partial<ErrorOutput["data"]>) => ErrorOutput;
  warning: (message: string) => CommandOutput;
  info: (message: string) => CommandOutput;
  progress: (current: number, total: number, message?: string) => ProgressOutput;
  composite: (...outputs: CommandOutput[]) => CompositeOutput;
}
