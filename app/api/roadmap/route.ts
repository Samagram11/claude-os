import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agents";
import { commitAgentWrite } from "@/lib/git";
import { PLANNER_GATHER_PROMPT, PLANNER_SYNTHESIZE_PROMPT } from "@/lib/prompts/planner";

const RESEARCH_TASKS = [
  {
    id: "customer",
    agentName: "Customer Agent",
    task: "Review wiki/customer-requests.md. List the top 3 most requested features, which customers asked for each, and whether a prototype or implementation exists. Note any urgency signals.",
  },
  {
    id: "product",
    agentName: "Product Agent",
    task: "Review wiki/projects/ pages. What features have working prototypes ready to ship? What's the status of each project? How many engineers are available for Q3 work? Note anything in a feature branch.",
  },
  {
    id: "sales",
    agentName: "Sales Agent",
    task: "Review wiki/deal-risks.md and wiki/deals/ pages. Which accounts are at risk and why? What features would help retain them? Note dollar amounts, renewal dates, and competitive threats.",
  },
];

export async function POST() {
  // Phase 1: Research agents run in parallel
  const researchPromises = RESEARCH_TASKS.map(async (task) => {
    const prompt = PLANNER_GATHER_PROMPT.replace("{task}", task.task);

    try {
      const result = await runAgent({
        name: task.agentName,
        systemPrompt: prompt,
        allowedReadPaths: ["wiki/"],
        allowedWritePaths: [],
      });

      // The agent's text output contains its findings
      // Also check if it read files (to show in the UI)
      return {
        id: task.id,
        agentName: task.agentName,
        output: result.output || "No findings returned.",
        filesRead: result.filesRead,
        error: null,
      };
    } catch (err) {
      return {
        id: task.id,
        agentName: task.agentName,
        output: "",
        filesRead: [],
        error: String(err),
      };
    }
  });

  const researchResults = await Promise.all(researchPromises);

  const customerFindings = researchResults.find((r) => r.id === "customer")?.output || "No data.";
  const productFindings = researchResults.find((r) => r.id === "product")?.output || "No data.";
  const salesFindings = researchResults.find((r) => r.id === "sales")?.output || "No data.";

  // Phase 2: Planner synthesizes the findings into a roadmap
  const synthesizePrompt = PLANNER_SYNTHESIZE_PROMPT
    .replace("{customer_findings}", customerFindings)
    .replace("{product_findings}", productFindings)
    .replace("{sales_findings}", salesFindings);

  let roadmapFile: string | null = null;
  let plannerOutput = "";

  try {
    const synthesisResult = await runAgent({
      name: "The Planner",
      systemPrompt: synthesizePrompt,
      allowedReadPaths: ["wiki/"],
      allowedWritePaths: ["wiki/roadmaps/"],
    });

    if (synthesisResult.filesWritten.length > 0) {
      await commitAgentWrite(
        "The Planner",
        synthesisResult.filesWritten,
        `Planner: drafted Q3 2026 roadmap`
      );
      roadmapFile = synthesisResult.filesWritten[0];
    }
    plannerOutput = synthesisResult.output;
  } catch (error) {
    return NextResponse.json(
      { error: "Roadmap synthesis failed", details: String(error) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    research: researchResults,
    roadmapFile,
    plannerOutput,
  });
}
