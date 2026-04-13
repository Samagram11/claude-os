import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agents";
import { commitAgentWrite } from "@/lib/git";
import { DEAL_WATCHER_PROMPT } from "@/lib/prompts/deal-watcher";
import { TECH_RADAR_PROMPT } from "@/lib/prompts/tech-radar";
import { DEAL_AGENT_PROMPT } from "@/lib/prompts/deal-agent";
import { CONNECTOR_PROMPT } from "@/lib/prompts/connector";

const AGENT_CONFIGS = {
  "customer-signal": {
    name: "Customer Agent",
    systemPrompt: DEAL_WATCHER_PROMPT,
    allowedReadPaths: ["sources/email/", "wiki/"],
    allowedWritePaths: ["wiki/"],
    updateOnly: true,
  },
  "engineering-radar": {
    name: "Product Agent",
    systemPrompt: TECH_RADAR_PROMPT,
    allowedReadPaths: ["sources/slack/", "wiki/"],
    allowedWritePaths: ["wiki/projects/", "wiki/people/"],
    updateOnly: true,
  },
  "deal-agent": {
    name: "Sales Agent",
    systemPrompt: DEAL_AGENT_PROMPT,
    allowedReadPaths: ["sources/calendar/", "sources/sheets/", "wiki/"],
    allowedWritePaths: ["wiki/"],
    updateOnly: true,
  },
  connector: {
    name: "The Connector",
    systemPrompt: CONNECTOR_PROMPT,
    allowedReadPaths: ["wiki/"],
    allowedWritePaths: ["blindspots/"],
    model: "claude-opus-4-6",
    extendedThinking: true,
  },
};

export async function POST(request: NextRequest) {
  const { agent } = await request.json();

  const config = AGENT_CONFIGS[agent as keyof typeof AGENT_CONFIGS];
  if (!config) {
    return NextResponse.json(
      { error: `Unknown agent: ${agent}` },
      { status: 400 }
    );
  }

  try {
    const result = await runAgent(config);

    if (result.filesWritten.length > 0) {
      await commitAgentWrite(
        config.name,
        result.filesWritten,
        `${config.name}: ${result.filesWritten.map((f) => f.split("/").pop()).join(", ")}`
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Agent ${agent} failed:`, error);
    return NextResponse.json(
      {
        error: `Agent ${agent} failed`,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
