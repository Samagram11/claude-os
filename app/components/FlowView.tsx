"use client";

import { Mail, MessageSquare, Calendar, Table2, Loader2, CheckCircle, AlertTriangle, Sparkles, FileText } from "lucide-react";
import { AgentState } from "./AgentCard";

type NodeStatus = "idle" | "active" | "done" | "error";

const SOURCE_ICONS = { email: Mail, slack: MessageSquare, calendar: Calendar, sheets: Table2 };

function getNodeStatus(agent: AgentState): NodeStatus {
  if (agent.status === "done") return "done";
  if (agent.status === "error") return "error";
  if (agent.status === "idle") return "idle";
  return "active";
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  text: string;
}

interface SourceNode {
  type: "email" | "slack" | "calendar" | "sheets";
  label: string;
  timestamp: string;
  preview: string;
  file: string;
}

interface FlowRow {
  sources: SourceNode[];
  agentId: string;
  agentName: string;
}

const FLOW_ROWS: FlowRow[] = [
  {
    sources: [{ type: "email", label: "Customer email", timestamp: "Apr 8", preview: "Asking about alerting capabilities", file: "sources/email/halcyon-feature-request.md" }],
    agentId: "customer-signal",
    agentName: "Customer Agent",
  },
  {
    sources: [{ type: "slack", label: "Slack post", timestamp: "Mar 22", preview: "Smart Alerts prototype ready", file: "sources/slack/james-hackathon-post.md" }],
    agentId: "engineering-radar",
    agentName: "Product Agent",
  },
  {
    sources: [
      { type: "calendar", label: "CRM update", timestamp: "Apr 3", preview: "Halcyon flagged at-risk", file: "sources/calendar/halcyon-qbr-notes.md" },
      { type: "sheets", label: "Spreadsheet", timestamp: "Apr 10", preview: "Renewal window closing", file: "sources/sheets/renewals-tracker.md" },
    ],
    agentId: "deal-agent",
    agentName: "Sales Agent",
  },
];

interface FlowViewProps {
  agents: Record<string, AgentState>;
  connectorStatus: "idle" | "thinking" | "done" | "error";
  messages: AgentMessage[];
  sourceVisible: Set<string>;
  onFileClick: (path: string) => void;
}

export default function FlowView({ agents, connectorStatus, messages, sourceVisible, onFileClick }: FlowViewProps) {
  return (
    <div className="w-full">
      {/* Column headers */}
      <div className="flex items-center mb-4 px-1">
        <div className="w-[200px] shrink-0"><span className="text-label text-ink-dim">Data Source</span></div>
        <div className="w-[36px] shrink-0" />
        <div className="w-[170px] shrink-0"><span className="text-label text-ink-dim">Agent</span></div>
        <div className="w-[36px] shrink-0" />
        <div className="flex-1"><span className="text-label text-ink-dim">Meridian Wiki</span></div>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {FLOW_ROWS.map((row) => {
          const agent = agents[row.agentId];
          if (!agent) return null;
          const nodeStatus = getNodeStatus(agent);
          const writtenFiles = agent.activities.filter((a) => a.type === "write");
          const hasDone = nodeStatus === "done";
          const anySrcVisible = row.sources.some((s) => sourceVisible.has(s.type));

          return (
            <div key={row.agentId} className="flex items-start">
              {/* Source(s) */}
              <div className="w-[200px] shrink-0 space-y-1.5">
                {row.sources.map((src) => {
                  const isVisible = sourceVisible.has(src.type);
                  const Icon = SOURCE_ICONS[src.type];
                  return (
                    <button
                      key={src.type}
                      onClick={() => isVisible && onFileClick(src.file)}
                      className={`w-full rounded-lg border p-2.5 transition-all text-left ${
                        isVisible
                          ? "border-border-subtle bg-elevated hover:bg-hover cursor-pointer"
                          : "border-border-subtle/50 bg-sidebar/80"
                      }`}
                      style={{ transition: "all 400ms cubic-bezier(0.2, 0, 0, 1)" }}
                      disabled={!isVisible}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon size={12} strokeWidth={1.5} className={isVisible ? "text-ink-muted" : "text-ink-dim/60"} />
                        <span className={`text-[11px] ${isVisible ? "text-ink-muted" : "text-ink-dim/60"}`}>{src.label}</span>
                        <span className={`text-[10px] ml-auto ${isVisible ? "text-ink-dim" : "text-ink-dim/40"}`}>{src.timestamp}</span>
                      </div>
                      <div className={`text-[11px] truncate ${isVisible ? "text-ink" : "text-ink-dim/60"}`}>{src.preview}</div>
                    </button>
                  );
                })}
              </div>

              {/* Arrow → */}
              <div className="w-[36px] flex items-center justify-center shrink-0 pt-3">
                <div className={`h-px flex-1 ${anySrcVisible ? "bg-border-subtle" : "bg-transparent"}`} style={{ transition: "background 400ms" }} />
                {anySrcVisible && <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-border-subtle shrink-0" />}
              </div>

              {/* Agent */}
              <div
                className={`w-[170px] shrink-0 rounded-lg border p-2.5 transition-all mt-0.5 ${
                  nodeStatus === "active" ? "border-accent/40 bg-accent/[0.05]"
                    : nodeStatus === "done" ? "border-success/25 bg-canvas"
                    : nodeStatus === "error" ? "border-danger/30 bg-canvas"
                    : "border-border-subtle bg-canvas opacity-30"
                }`}
                style={{ transition: "all 300ms cubic-bezier(0.2, 0, 0, 1)" }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-medium text-ink">{row.agentName}</span>
                  {nodeStatus === "active" && <Loader2 size={11} strokeWidth={2} className="text-accent animate-spin" />}
                  {nodeStatus === "done" && <CheckCircle size={11} strokeWidth={1.5} className="text-success" />}
                  {nodeStatus === "error" && <AlertTriangle size={11} strokeWidth={1.5} className="text-danger" />}
                </div>
                <div className="text-[10px] text-ink-dim truncate">
                  {nodeStatus === "active" && "Updating wiki..."}
                  {nodeStatus === "done" && `Updated ${writtenFiles.length} page${writtenFiles.length !== 1 ? "s" : ""}`}
                  {nodeStatus === "error" && "Failed"}
                  {nodeStatus === "idle" && "Waiting"}
                </div>
              </div>

              {/* Arrow → */}
              <div className="w-[36px] flex items-center justify-center shrink-0 pt-3">
                <div className={`h-px flex-1 ${hasDone ? "bg-success/30" : "bg-transparent"}`} style={{ transition: "background 400ms" }} />
                {hasDone && <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-success/30 shrink-0" />}
              </div>

              {/* Wiki files updated */}
              <div className="flex-1 flex flex-wrap items-start gap-1.5 pt-1">
                {hasDone && writtenFiles.map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => wf.file && onFileClick(wf.file)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md border border-success/20 bg-success/[0.03] hover:bg-hover cursor-pointer transition-colors"
                    style={{ animation: "fadeSlideIn 300ms cubic-bezier(0.2, 0, 0, 1)" }}
                  >
                    <FileText size={10} strokeWidth={1.5} className="text-success shrink-0" />
                    <span className="text-[10px] text-ink-muted font-mono truncate">
                      {wf.file?.split("/").pop()?.replace(".md", "")}
                    </span>
                  </button>
                ))}
                {nodeStatus === "active" && (
                  <div className="flex items-center gap-1 px-2 py-1">
                    <Loader2 size={10} strokeWidth={2} className="text-accent animate-spin" />
                    <span className="text-[10px] text-ink-dim">writing...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* World model update summary */}
      {messages.length > 0 && (
        <div className="mt-6 border-t border-border-subtle pt-5">
          <span className="text-label text-ink-dim block mb-3">Meridian Wiki Updated</span>
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-elevated"
                style={{ animation: "fadeSlideIn 300ms cubic-bezier(0.2, 0, 0, 1)" }}
              >
                <FileText size={12} strokeWidth={1.5} className="text-success mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-ink">{msg.from}</span>
                  <p className="text-[12px] text-ink-muted leading-[17px] mt-0.5">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connector */}
      {connectorStatus !== "idle" && (
        <div className="flex justify-center mt-5">
          <div
            className={`w-[500px] rounded-xl border p-4 transition-all ${
              connectorStatus === "thinking" ? "border-accent/40 bg-accent/[0.04]"
                : connectorStatus === "done" ? "border-success/25 bg-canvas"
                : "border-danger/30 bg-canvas"
            }`}
            style={{ transition: "all 300ms cubic-bezier(0.2, 0, 0, 1)" }}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <Sparkles size={14} strokeWidth={1.5} className="text-accent" />
              <span className="text-[13px] font-medium text-ink">The Connector</span>
              {connectorStatus === "thinking" && <Loader2 size={12} strokeWidth={2} className="text-accent animate-spin ml-auto" />}
              {connectorStatus === "done" && <CheckCircle size={12} strokeWidth={1.5} className="text-success ml-auto" />}
              {connectorStatus === "error" && <AlertTriangle size={12} strokeWidth={1.5} className="text-danger ml-auto" />}
            </div>
            <div className="text-[12px] text-ink-dim">
              {connectorStatus === "thinking" && "Reading the Meridian Wiki, looking for cross-domain connections..."}
              {connectorStatus === "done" && "Blindspot identified — see below"}
              {connectorStatus === "error" && "Failed to synthesize"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
