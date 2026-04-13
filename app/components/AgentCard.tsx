"use client";

import {
  Search,
  Pencil,
  Loader2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Brain,
} from "lucide-react";

export interface AgentActivity {
  id: string;
  type: "read" | "write" | "info" | "thinking";
  message: string;
  file?: string;
}

export interface AgentState {
  id: string;
  name: string;
  role: string;
  source: string;
  status: "idle" | "ingesting" | "scanning" | "writing" | "done" | "error";
  activities: AgentActivity[];
  summary: string | null;
  errorMessage: string | null;
}

const statusConfig = {
  idle: { label: "Waiting", color: "text-ink-dim", bg: "bg-transparent" },
  ingesting: { label: "Ingesting data", color: "text-accent", bg: "bg-accent/5" },
  scanning: { label: "Scanning", color: "text-accent", bg: "bg-accent/5" },
  writing: { label: "Writing signal", color: "text-success", bg: "bg-success/5" },
  done: { label: "Complete", color: "text-success", bg: "bg-transparent" },
  error: { label: "Failed", color: "text-danger", bg: "bg-transparent" },
};

export default function AgentCard({ agent }: { agent: AgentState }) {
  const config = statusConfig[agent.status];
  const isActive = agent.status === "ingesting" || agent.status === "scanning" || agent.status === "writing";

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        isActive
          ? "border-accent/30 bg-accent/[0.03]"
          : agent.status === "done"
            ? "border-success/20 bg-canvas"
            : "border-border-subtle bg-canvas"
      }`}
      style={{ transition: "all 300ms cubic-bezier(0.2, 0, 0, 1)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-medium text-ink">{agent.name}</h3>
          <p className="text-[13px] text-ink-muted mt-0.5">{agent.role}</p>
        </div>
        <div className={`flex items-center gap-1.5 text-[12px] ${config.color}`}>
          {isActive && (
            <Loader2 size={12} strokeWidth={2} className="animate-spin" />
          )}
          {agent.status === "done" && (
            <CheckCircle size={12} strokeWidth={2} />
          )}
          {agent.status === "error" && (
            <AlertTriangle size={12} strokeWidth={2} />
          )}
          <span>{config.label}</span>
        </div>
      </div>

      {/* Activity feed */}
      {agent.activities.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {agent.activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-2">
              {activity.type === "read" && (
                <Search size={12} strokeWidth={1.5} className="text-ink-dim mt-0.5 shrink-0" />
              )}
              {activity.type === "write" && (
                <Pencil size={12} strokeWidth={1.5} className="text-success mt-0.5 shrink-0" />
              )}
              {activity.type === "info" && (
                <FileText size={12} strokeWidth={1.5} className="text-ink-dim mt-0.5 shrink-0" />
              )}
              {activity.type === "thinking" && (
                <Brain size={12} strokeWidth={1.5} className="text-accent mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <span className="text-[12px] text-ink-muted block leading-[18px]">
                  {activity.message}
                </span>
                {activity.file && (
                  <span className="text-[11px] text-ink-dim font-mono block truncate">
                    {activity.file}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {agent.summary && (
        <div className="border-t border-border-subtle pt-3 mt-3">
          <p className="text-[13px] text-ink-muted leading-[20px]">
            {agent.summary}
          </p>
        </div>
      )}

      {/* Error */}
      {agent.errorMessage && (
        <div className="border-t border-border-subtle pt-3 mt-3">
          <p className="text-[12px] text-danger leading-[18px]">
            {agent.errorMessage}
          </p>
        </div>
      )}

      {/* Idle state */}
      {agent.status === "idle" && agent.activities.length === 0 && (
        <div className="py-2">
          <p className="text-[12px] text-ink-dim">
            Will scan <span className="font-mono">{agent.source}</span> data
          </p>
        </div>
      )}
    </div>
  );
}
