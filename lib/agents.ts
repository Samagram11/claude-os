import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";

const COMMONS_PATH = path.join(process.cwd(), "commons");

const client = new Anthropic();

interface AgentConfig {
  name: string;
  systemPrompt: string;
  allowedReadPaths: string[];
  allowedWritePaths: string[];
  updateOnly?: boolean; // If true, can only write to files that already exist (no new files)
  model?: string;
  extendedThinking?: boolean;
}

interface AgentResult {
  agentName: string;
  filesRead: string[];
  filesWritten: string[];
  output: string;
  thinkingTrace?: string;
}

const tools: Anthropic.Tool[] = [
  {
    name: "list_files",
    description:
      "List all files in a directory within The Commons. Returns file paths relative to /commons/.",
    input_schema: {
      type: "object" as const,
      properties: {
        directory: {
          type: "string",
          description:
            "Directory path relative to /commons/ (e.g., 'sources/email', 'wiki/people')",
        },
      },
      required: ["directory"],
    },
  },
  {
    name: "read_file",
    description:
      "Read the contents of a file within The Commons. Path is relative to /commons/.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description:
            "File path relative to /commons/ (e.g., 'sources/email/acme-deal-confirmation.md')",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description:
      "Write content to a file within The Commons. Path is relative to /commons/. Creates directories as needed.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description:
            "File path relative to /commons/ (e.g., 'signals/deals/acme-risk.md')",
        },
        content: {
          type: "string",
          description: "The full content to write to the file",
        },
      },
      required: ["path", "content"],
    },
  },
];

function isPathAllowed(filePath: string, allowedPaths: string[]): boolean {
  const normalized = filePath.replace(/^\//, "").replace(/\/$/, "");
  return allowedPaths.some((allowed) => {
    const normalizedAllowed = allowed.replace(/\/$/, "");
    return (
      normalized.startsWith(normalizedAllowed + "/") ||
      normalized === normalizedAllowed
    );
  });
}

async function handleToolCall(
  toolName: string,
  toolInput: Record<string, string>,
  config: AgentConfig,
  result: AgentResult
): Promise<string> {
  switch (toolName) {
    case "list_files": {
      const dirPath = toolInput.directory.replace(/^\//, "");
      if (
        !isPathAllowed(
          dirPath,
          [...config.allowedReadPaths, ...config.allowedWritePaths]
        )
      ) {
        return `Error: Access denied to directory '${dirPath}'`;
      }
      const fullPath = path.join(COMMONS_PATH, dirPath);
      try {
        const entries = await fs.readdir(fullPath, { recursive: true });
        const files = [];
        for (const entry of entries) {
          const entryPath = path.join(fullPath, entry.toString());
          const stat = await fs.stat(entryPath);
          if (stat.isFile()) {
            files.push(path.join(dirPath, entry.toString()));
          }
        }
        return files.join("\n") || "(empty directory)";
      } catch {
        return `Error: Directory '${dirPath}' not found`;
      }
    }

    case "read_file": {
      const filePath = toolInput.path.replace(/^\//, "");
      if (!isPathAllowed(filePath, config.allowedReadPaths)) {
        return `Error: Access denied to file '${filePath}'`;
      }
      const fullPath = path.join(COMMONS_PATH, filePath);
      try {
        const content = await fs.readFile(fullPath, "utf-8");
        result.filesRead.push(filePath);
        return content;
      } catch {
        return `Error: File '${filePath}' not found`;
      }
    }

    case "write_file": {
      const filePath = toolInput.path.replace(/^\//, "");
      if (!isPathAllowed(filePath, config.allowedWritePaths)) {
        return `Error: Access denied to write '${filePath}'`;
      }
      const fullPath = path.join(COMMONS_PATH, filePath);
      // If updateOnly, reject writes to files that don't exist yet
      if (config.updateOnly) {
        try {
          await fs.access(fullPath);
        } catch {
          return `Error: Cannot create new file '${filePath}'. You can only update existing wiki pages.`;
        }
      } else {
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
      }
      await fs.writeFile(fullPath, toolInput.content, "utf-8");
      result.filesWritten.push(filePath);
      return `Successfully updated '${filePath}'`;
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

export async function runAgent(config: AgentConfig): Promise<AgentResult> {
  const result: AgentResult = {
    agentName: config.name,
    filesRead: [],
    filesWritten: [],
    output: "",
    thinkingTrace: undefined,
  };

  const model = config.model || "claude-sonnet-4-6";
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content:
        "Scan your assigned data sources and write your findings as a signal file. Be specific, cite evidence, and link to relevant wiki pages with [[wikilinks]].",
    },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const requestParams: Anthropic.MessageCreateParams = {
      model,
      max_tokens: config.extendedThinking ? 16000 : 1500,
      system: config.systemPrompt,
      tools,
      messages,
    };

    if (config.extendedThinking) {
      requestParams.thinking = {
        type: "enabled",
        budget_tokens: 10000,
      };
    }

    const response = await client.messages.create(requestParams);

    const assistantContent = response.content;
    messages.push({ role: "assistant", content: assistantContent });

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of assistantContent) {
        if (block.type === "thinking" && config.extendedThinking) {
          result.thinkingTrace = block.thinking;
        }
        if (block.type === "tool_use") {
          const toolResult = await handleToolCall(
            block.name,
            block.input as Record<string, string>,
            config,
            result
          );
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: toolResult,
          });
        }
      }

      messages.push({ role: "user", content: toolResults });
    } else {
      for (const block of assistantContent) {
        if (block.type === "thinking" && config.extendedThinking) {
          result.thinkingTrace = block.thinking;
        }
        if (block.type === "text") {
          result.output += block.text;
        }
      }
      continueLoop = false;
    }
  }

  return result;
}
