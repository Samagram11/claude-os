import { NextRequest, NextResponse } from "next/server";
import { commitHumanDecision } from "@/lib/git";
import fs from "fs/promises";
import path from "path";

const COMMONS_PATH = path.join(process.cwd(), "commons");

export async function POST(request: NextRequest) {
  const { decision, option, blindspotFile } = await request.json();

  try {
    const decisionContent = `---
type: decision
blindspot: ${blindspotFile}
chosen_option: ${option}
decided_by: human
decided_at: ${new Date().toISOString()}
---

# Decision: ${decision}

## Context
This decision was made in response to the blindspot identified in [[${blindspotFile.replace(".md", "").split("/").pop()}]].

## Chosen Option
${option}
`;

    const decisionFile = `blindspots/decision-${Date.now()}.md`;
    const fullPath = path.join(COMMONS_PATH, decisionFile);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, decisionContent, "utf-8");

    await commitHumanDecision(decision, [decisionFile, blindspotFile]);

    return NextResponse.json({
      success: true,
      file: decisionFile,
    });
  } catch (error) {
    console.error("Commit failed:", error);
    return NextResponse.json(
      { error: "Failed to commit decision", details: String(error) },
      { status: 500 }
    );
  }
}
