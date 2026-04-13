"use client";

import { useState, useCallback } from "react";
import { Play, Loader2, RotateCcw, FolderOpen, CheckCircle } from "lucide-react";
import { AgentState, AgentActivity } from "./components/AgentCard";
import FlowView, { AgentMessage } from "./components/FlowView";
import BlindspotCard from "./components/BlindspotCard";
import FileDrawer from "./components/FileDrawer";
import { BlindspotData } from "./components/types";
import UserSwitcher from "./components/UserSwitcher";
import DanView from "./components/DanView";
import RoadmapPlanner from "./components/RoadmapPlanner";

const AGENT_DEFS = [
  { id: "customer-signal", name: "Customer Agent", role: "Logs customer feature requests from email", source: "email" },
  { id: "engineering-radar", name: "Product Agent", role: "Tracks engineering capabilities from Slack", source: "slack" },
  { id: "deal-agent", name: "Sales Agent", role: "Assesses deal risks from CRM and financial data", source: "calendar" },
];

// The cascade sequence — defines what happens step by step
const CASCADE_STEPS = [
  { ingestSources: ["email"], agentId: "customer-signal" },
  { ingestSources: ["slack"], agentId: "engineering-radar" },
  { ingestSources: ["calendar", "sheets"], agentId: "deal-agent" },
];

function parseBlindspot(content: string, file: string): BlindspotData | null {
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\s*/m, "");
  const titleMatch = withoutFrontmatter.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : "Blindspot Detected";
  const body = withoutFrontmatter.replace(/^#\s+.+\n*/m, "").trim();
  const signalRefs = content.match(/wiki\/[a-z-]+(?:\/[a-z-]+)?\.md/g) || [];
  const signals = signalRefs.length > 0 ? [...new Set(signalRefs)] : [];
  return { title, content: body, file, signals };
}

function makeActivity(type: AgentActivity["type"], message: string, file?: string): AgentActivity {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, message, file };
}

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [activeUser, setActiveUser] = useState("priya");
  const [drawerFile, setDrawerFile] = useState<string | null>(null);
  const [visibleSources, setVisibleSources] = useState<Set<string>>(new Set());
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);

  const [agents, setAgents] = useState<Record<string, AgentState>>(() => {
    const initial: Record<string, AgentState> = {};
    for (const def of AGENT_DEFS) {
      initial[def.id] = { ...def, status: "idle", activities: [], summary: null, errorMessage: null };
    }
    return initial;
  });

  const [connectorStatus, setConnectorStatus] = useState<"idle" | "thinking" | "done" | "error">("idle");
  const [thinkingTrace, setThinkingTrace] = useState<string | null>(null);
  const [blindspot, setBlindspot] = useState<BlindspotData | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [approvedOption, setApprovedOption] = useState<string | null>(null);
  const [approvedPersonName, setApprovedPersonName] = useState<string | null>(null);
  const [approvedOptionDetail, setApprovedOptionDetail] = useState<string | null>(null);

  const updateAgent = useCallback((id: string, updates: Partial<AgentState>) => {
    setAgents((prev) => ({ ...prev, [id]: { ...prev[id], ...updates } }));
  }, []);

  const addAgentActivity = useCallback((id: string, activity: AgentActivity) => {
    setAgents((prev) => ({
      ...prev,
      [id]: { ...prev[id], activities: [...prev[id].activities, activity] },
    }));
  }, []);

  const runCascade = async () => {
    setIsRunning(true);
    setBlindspot(null);
    setCommitted(false);
    setApprovedOption(null);
    setThinkingTrace(null);
    setConnectorStatus("idle");
    setAgentMessages([]);
    setVisibleSources(new Set());

    const resetAgents: Record<string, AgentState> = {};
    for (const def of AGENT_DEFS) {
      resetAgents[def.id] = { ...def, status: "idle", activities: [], summary: null, errorMessage: null };
    }
    setAgents(resetAgents);

    // Run each cascade step sequentially
    for (const step of CASCADE_STEPS) {
      const { ingestSources, agentId } = step;

      // 1. Show and ingest each source for this step
      for (const source of ingestSources) {
        setVisibleSources((prev) => new Set([...prev, source]));
        await new Promise((r) => setTimeout(r, 500));

        updateAgent(agentId, { status: "ingesting" });
        addAgentActivity(agentId, makeActivity("info", `Ingesting ${source} data...`));

        try {
          const res = await fetch("/api/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source }),
          });
          const data = await res.json();
          if (data.file) {
            addAgentActivity(agentId, makeActivity("read", `Ingested ${data.file.split("/").pop()}`, data.file));
          }
        } catch {
          addAgentActivity(agentId, makeActivity("info", `Failed to ingest ${source}`));
        }
        await new Promise((r) => setTimeout(r, 300));
      }

      // 2. Run the agent
      updateAgent(agentId, { status: "scanning" });
      addAgentActivity(agentId, makeActivity("info", "Updating wiki..."));

      try {
        const res = await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent: agentId }),
        });
        const result = await res.json();

        if (result.error) {
          updateAgent(agentId, { status: "error", errorMessage: result.details || result.error });
        } else {
          for (const file of result.filesRead || []) {
            addAgentActivity(agentId, makeActivity("read", `Read ${file.split("/").pop()}`, file));
          }
          if (result.filesWritten?.length > 0) {
            updateAgent(agentId, { status: "writing" });
            for (const file of result.filesWritten) {
              addAgentActivity(agentId, makeActivity("write", `Updated ${file.split("/").pop()}`, file));
            }
          }
          const summaryText = result.output
            ? result.output.slice(0, 150).replace(/\n/g, " ").trim()
            : "Wiki updated.";
          updateAgent(agentId, { status: "done", summary: summaryText });
        }
      } catch (err) {
        updateAgent(agentId, { status: "error", errorMessage: String(err) });
      }

      await new Promise((r) => setTimeout(r, 400));
    }

    // World model update messages
    const agentNames: Record<string, string> = {
      "customer-signal": "Customer Agent",
      "engineering-radar": "Product Agent",
      "deal-agent": "Sales Agent",
    };

    for (const def of AGENT_DEFS) {
      const agent = agents[def.id];
      if (!agent) continue;
      const writtenFiles = agent.activities.filter((a: AgentActivity) => a.type === "write");
      if (writtenFiles.length === 0) continue;

      const fileNames = writtenFiles
        .map((wf: AgentActivity) => wf.file?.split("/").pop()?.replace(".md", ""))
        .filter(Boolean)
        .join(", ");

      setAgentMessages((prev) => [...prev, {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        from: agentNames[def.id] || def.id,
        to: "Meridian Wiki",
        text: `Updated ${fileNames}`,
      }]);
      await new Promise((r) => setTimeout(r, 400));
    }

    // Connector
    setConnectorStatus("thinking");

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: "connector" }),
      });
      const result = await res.json();

      if (result.error) {
        setConnectorStatus("error");
      } else {
        if (result.thinkingTrace) setThinkingTrace(result.thinkingTrace);
        for (const file of result.filesWritten || []) {
          try {
            const fileRes = await fetch(`/api/commons?file=${encodeURIComponent(file)}`);
            const fileData = await fileRes.json();
            if (fileData.content) {
              const parsed = parseBlindspot(fileData.content, file);
              if (parsed) setBlindspot(parsed);
            }
          } catch { /* */ }
        }
        setConnectorStatus("done");
      }
    } catch {
      setConnectorStatus("error");
    }

    setIsRunning(false);
  };

  const handleApprove = async (option: string, personKey: string | null, personName: string | null, fullOptionText: string) => {
    if (!blindspot) return;
    setIsCommitting(true);
    try {
      await fetch("/api/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: option, option, blindspotFile: blindspot.file }),
      });
      setCommitted(true);
      setApprovedOption(option);
      setApprovedPersonName(personName);
      setApprovedOptionDetail(fullOptionText);
    } catch { /* */ }
    setIsCommitting(false);
  };

  const handleDecline = () => setBlindspot(null);

  const handleReset = async () => {
    await fetch("/api/reset", { method: "POST" });
    const resetAgents: Record<string, AgentState> = {};
    for (const def of AGENT_DEFS) {
      resetAgents[def.id] = { ...def, status: "idle", activities: [], summary: null, errorMessage: null };
    }
    setAgents(resetAgents);
    setConnectorStatus("idle");
    setThinkingTrace(null);
    setBlindspot(null);
    setCommitted(false);
    setApprovedOption(null);
    setApprovedPersonName(null);
    setApprovedOptionDetail(null);
    setVisibleSources(new Set());
    setAgentMessages([]);
  };

  const hasActivity = isRunning || connectorStatus !== "idle" || Object.values(agents).some((a) => a.status !== "idle");

  return (
    <div className="flex flex-col h-full bg-canvas">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border-subtle shrink-0">
        <div className="flex items-center">
          <div className="flex items-center gap-2.5 px-5 py-3 border-r border-border-subtle">
            <img src="/clawd-cropped.png" alt="" className="w-8 h-8 object-contain" style={{ mixBlendMode: "lighten" }} />
            <span className="font-serif text-[18px] font-medium text-ink">ClaudeOS</span>
          </div>
          <button
            onClick={() => setDrawerFile("__browse__")}
            className="flex items-center gap-2 px-4 py-2 border-r border-border-subtle text-[13px] text-ink-muted hover:text-ink transition-colors"
          >
            <FolderOpen size={14} strokeWidth={1.5} className="text-ink-dim" />
            Meridian Wiki
          </button>
          <div className="px-3 py-2">
            <UserSwitcher activeUser={activeUser} onSwitch={setActiveUser} actionOwner={approvedPersonName} />
          </div>
        </div>
        <div className="flex items-center gap-2 px-6">
          <button onClick={handleReset} disabled={isRunning} className="flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm text-ink-muted border border-border-subtle hover:bg-hover transition-colors disabled:opacity-30">
            <RotateCcw size={14} strokeWidth={1.5} />
            Reset
          </button>
          <button
            onClick={runCascade}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-body-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: isRunning ? "var(--color-elevated)" : "var(--color-accent)", color: isRunning ? "var(--color-ink-muted)" : "#fff" }}
          >
            {isRunning ? (<><Loader2 size={14} strokeWidth={1.5} className="animate-spin" />Running...</>) : (<><Play size={14} strokeWidth={1.5} fill="currentColor" />Go</>)}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeUser === "priya" ? (
          <div className="px-6 py-8">
            {!hasActivity && !blindspot && !committed && (
              <div className="flex flex-col items-center mt-12 mb-12">
                <img
                  src="/clawd-cropped.png"
                  alt=""
                  className="w-[320px] h-[320px] object-contain mb-4"
                  style={{ mixBlendMode: "lighten" }}
                />
                <h1 className="font-serif text-[28px] leading-[36px] font-medium text-ink">Welcome to ClaudeOS</h1>
              </div>
            )}

            {hasActivity && (
              <div className="mb-8">
                <FlowView
                  agents={agents}
                  connectorStatus={connectorStatus}
                  messages={agentMessages}
                  sourceVisible={visibleSources}
                  onFileClick={setDrawerFile}
                />
              </div>
            )}

            {blindspot && (
              <div className="max-w-[640px] mx-auto mb-6">
                <BlindspotCard
                  blindspot={blindspot}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  isCommitting={isCommitting}
                  committed={committed}
                  onFileClick={setDrawerFile}
                  onViewPerson={() => setActiveUser("dan")}
                  approvedPersonName={approvedPersonName}
                />
              </div>
            )}

            {committed && !blindspot && (
              <div className="max-w-[640px] mx-auto rounded-xl border border-success/30 bg-success/[0.03] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={16} strokeWidth={1.5} className="text-success" />
                    <span className="text-[14px] font-medium text-ink">Decision committed</span>
                  </div>
                  {approvedPersonName && (
                    <button
                      onClick={() => setActiveUser("dan")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-accent border border-accent/30 hover:bg-accent/[0.05] transition-colors"
                    >
                      View {approvedPersonName}&apos;s dashboard
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : activeUser === "lin" ? (
          <RoadmapPlanner onFileClick={setDrawerFile} />
        ) : (
          <DanView blindspot={blindspot} committed={committed} approvedOption={approvedOption} approvedPersonName={approvedPersonName} approvedOptionDetail={approvedOptionDetail} isRunning={isRunning} onBack={() => setActiveUser("priya")} onFileClick={setDrawerFile} />
        )}
      </div>

      <FileDrawer filePath={drawerFile} onClose={() => setDrawerFile(null)} onNavigate={setDrawerFile} />
    </div>
  );
}
