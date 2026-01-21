import type {
  CommandOutput,
  OutputBuilder,
  OutputMetadata,
  TextOutput,
  TableOutput,
  ListOutput,
  ListItem,
  TreeOutput,
  TreeNode,
  KeyValueOutput,
  ProgressOutput,
  ErrorOutput,
  SuccessOutput,
  CompositeOutput,
} from "../types";

export const Output: OutputBuilder = {
  text(content: string, metadata?: OutputMetadata): TextOutput {
    return { type: "text", data: content, metadata };
  },

  table(headers: string[], rows: any[][], metadata?: OutputMetadata): TableOutput {
    return { type: "table", data: { headers, rows }, metadata };
  },

  list(
    items: (string | ListItem)[],
    options?: { ordered?: boolean; style?: ListOutput["data"]["style"] },
    metadata?: OutputMetadata
  ): ListOutput {
    const normalizedItems: ListItem[] = items.map((item) =>
      typeof item === "string" ? { content: item } : item
    );
    return {
      type: "list",
      data: {
        items: normalizedItems,
        ordered: options?.ordered ?? false,
        style: options?.style ?? "bullet",
      },
      metadata,
    };
  },

  tree(root: TreeNode, metadata?: OutputMetadata): TreeOutput {
    return { type: "tree", data: root, metadata };
  },

  keyValue(pairs: KeyValueOutput["data"]["pairs"], metadata?: OutputMetadata): KeyValueOutput {
    return { type: "keyValue", data: { pairs }, metadata };
  },

  success(message: string, details?: string): SuccessOutput {
    return { type: "success", data: { message, details } };
  },

  error(message: string, options?: Partial<ErrorOutput["data"]>): ErrorOutput {
    return { type: "error", data: { message, ...options } };
  },

  warning(message: string): CommandOutput {
    return { type: "warning", data: { message } };
  },

  info(message: string): CommandOutput {
    return { type: "info", data: { message } };
  },

  progress(current: number, total: number, message?: string): ProgressOutput {
    return { type: "progress", data: { current, total, message } };
  },

  composite(...outputs: CommandOutput[]): CompositeOutput {
    return { type: "composite", data: null, children: outputs };
  },
};

export function isTextOutput(output: CommandOutput): output is TextOutput {
  return output.type === "text";
}

export function isTableOutput(output: CommandOutput): output is TableOutput {
  return output.type === "table";
}

export function isListOutput(output: CommandOutput): output is ListOutput {
  return output.type === "list";
}

export function isTreeOutput(output: CommandOutput): output is TreeOutput {
  return output.type === "tree";
}

export function isErrorOutput(output: CommandOutput): output is ErrorOutput {
  return output.type === "error";
}

export function isSuccessOutput(output: CommandOutput): output is SuccessOutput {
  return output.type === "success";
}

export function isCompositeOutput(output: CommandOutput): output is CompositeOutput {
  return output.type === "composite";
}

export function toOutput(value: any): CommandOutput {
  if (value === null || value === undefined) {
    return Output.text("");
  }

  if (value && typeof value === "object" && "type" in value && "data" in value) {
    return value as CommandOutput;
  }

  if (typeof value === "string") {
    return Output.text(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return Output.text("(empty)");
    }
    
    if (typeof value[0] === "object" && value[0] !== null) {
      const headers = Object.keys(value[0]);
      const rows = value.map((item) => headers.map((h) => item[h]));
      return Output.table(headers, rows);
    }
    
    return Output.list(value.map(String));
  }

  if (typeof value === "object") {
    const pairs = Object.entries(value).map(([key, val]) => ({ key, value: val }));
    return Output.keyValue(pairs);
  }

  return Output.text(String(value));
}

export function mergeOutputs(...outputs: CommandOutput[]): CommandOutput {
  if (outputs.length === 0) {
    return Output.text("");
  }
  if (outputs.length === 1) {
    return outputs[0];
  }
  return Output.composite(...outputs);
}

export function withMetadata(output: CommandOutput, metadata: OutputMetadata): CommandOutput {
  return { ...output, metadata: { ...output.metadata, ...metadata } };
}

export function withTitle(output: CommandOutput, title: string): CommandOutput {
  return withMetadata(output, { title });
}
