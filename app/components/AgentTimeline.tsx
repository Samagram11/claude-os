"use client";

import { Loader2, CheckCircle, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { AgentState } from "./AgentCard";
import { useState } from "react";

interface AgentTimelineProps {
  agents: Record<string, AgentState>;
  connectorStatus: "idle" | "thinking" | "done" | "error";
  onFileClick: (path: string) => void;
}

function AgentRow({ agent, onFileClick }: { agent: AgentState; onFileClick: (path: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = agent.status === "ingesting" || agent.status === "scanning" || agent.status === "writing";
  const isDone = agent.status === "done";
  const isError = agent.status === "error";

  const filesWritten = agent.activities.filter((a) => a.type === "write").length;

  return (
    <div>
      <button
        onClick={() => isDone && setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isDone ? "hover:bg-hover cursor-pointer" : ""
        }`}
      >
        <div className="w-5 flex justify-center shrink-0">
          {isActive && <Loader2 size={16} strokeWidth={2} className="text-accent animate-spin" />}
          {isDone && <CheckCircle size={16} strokeWidth={1.5} className="text-success" />}
          {isError && <AlertTriangle size={16} strokeWidth={1.5} className="text-danger" />}
          {agent.status === "idle" && <div className="w-2 h-2 rounded-full bg-border-subtle" />}
        </div>

        <div className="flex-1 text-left min-w-0">
          <span className="text-[14px] text-ink block">{agent.name}</span>
          <span className="text-[12px] text-ink-dim block truncate">
            {isActive && agent.activities[agent.activities.length - 1]?.message}
            {isDone && agent.summary}
            {isError && agent.errorMessage}
            {agent.status === "idle" && agent.role}
          </span>
        </div>

        {isDone && (
          <div className="flex items-center gap-3 shrink-0">
            {filesWritten > 0 && (
              <span className="text-[11px] text-success">{filesWritten} signal{filesWritten > 1 ? "s" : ""}</span>
            )}
            {expanded ? (
              <ChevronDown size={14} strokeWidth={1.5} className="text-ink-dim" />
            ) : (
              <ChevronRight size={14} strokeWidth={1.5} className="text-ink-dim" />
            )}
          </div>
        )}
      </button>

      {expanded && isDone && (
        <div className="ml-[32px] px-4 pb-3">
          <div className="border-l border-border-subtle pl-4 space-y-1">
            {agent.activities.map((activity) => (
              <div key={activity.id} className="text-[12px] text-ink-dim">
                {activity.file ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileClick(activity.file!);
                    }}
                    className={`hover:underline text-left ${
                      activity.type === "write" ? "text-success" : "text-ink-muted"
                    }`}
                  >
                    {activity.type === "read" ? "Read" : "Wrote"} {activity.file.split("/").pop()}
                  </button>
                ) : (
                  <span>{activity.message}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgentTimeline({ agents, connectorStatus, onFileClick }: AgentTimelineProps) {
  const agentList = Object.values(agents);
  const allIdle = agentList.every((a) => a.status === "idle");

  if (allIdle && connectorStatus === "idle") return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-canvas">
      <div className="px-4 py-3 border-b border-border-subtle">
        <span className="text-label text-ink-dim">Agents</span>
      </div>
      <div className="py-1">
        {agentList.map((agent) => (
          <AgentRow key={agent.id} agent={agent} onFileClick={onFileClick} />
        ))}

        {connectorStatus !== "idle" && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-5 flex justify-center shrink-0">
              {connectorStatus === "thinking" && <Loader2 size={16} strokeWidth={2} className="text-accent animate-spin" />}
              {connectorStatus === "done" && <CheckCircle size={16} strokeWidth={1.5} className="text-success" />}
              {connectorStatus === "error" && <AlertTriangle size={16} strokeWidth={1.5} className="text-danger" />}
            </div>
            <div className="flex-1">
              <span className="text-[14px] text-ink">The Connector</span>
              <span className="text-[12px] text-ink-dim block">
                {connectorStatus === "thinking" && "Synthesizing across all signals..."}
                {connectorStatus === "done" && "Insight identified"}
                {connectorStatus === "error" && "Failed"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
