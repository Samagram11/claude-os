"use client";

import {
  Search,
  FileText,
  Pencil,
  Brain,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Zap,
} from "lucide-react";
import { useState } from "react";

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  type: "info" | "read" | "write" | "thinking" | "warning" | "success" | "error";
  message: string;
  detail?: string;
}

interface ActivityLogProps {
  entries: LogEntry[];
  thinkingTrace: string | null;
}

const typeConfig = {
  info: { icon: Zap, color: "text-ink-muted" },
  read: { icon: Search, color: "text-ink-muted" },
  write: { icon: Pencil, color: "text-success" },
  thinking: { icon: Brain, color: "text-accent" },
  warning: { icon: AlertTriangle, color: "text-warning" },
  success: { icon: CheckCircle, color: "text-success" },
  error: { icon: AlertTriangle, color: "text-danger" },
};

export default function ActivityLog({ entries, thinkingTrace }: ActivityLogProps) {
  const [showThinking, setShowThinking] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border-subtle">
        <span className="text-label text-ink-dim">Activity</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <p className="text-ink-dim text-body-sm text-center">
              Press Go to start the agent cascade
            </p>
          </div>
        ) : (
          <div className="py-2">
            {entries.map((entry) => {
              const config = typeConfig[entry.type];
              const Icon = config.icon;
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-2.5 px-4 py-1.5"
                >
                  <Icon
                    size={14}
                    strokeWidth={1.5}
                    className={`${config.color} mt-0.5 shrink-0`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-body-sm text-ink truncate">
                        {entry.message}
                      </span>
                    </div>
                    {entry.detail && (
                      <span className="text-[12px] text-ink-dim font-mono block truncate">
                        {entry.detail}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-ink-dim shrink-0 tabular-nums">
                    {entry.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {thinkingTrace && (
        <div className="border-t border-border-subtle">
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-body-sm text-accent hover:bg-hover transition-colors"
          >
            <Brain size={14} strokeWidth={1.5} />
            <span>Connector&apos;s reasoning</span>
          </button>
          {showThinking && (
            <div className="px-4 pb-3 max-h-[300px] overflow-y-auto">
              <pre className="text-[12px] leading-[18px] text-ink-muted font-mono whitespace-pre-wrap">
                {thinkingTrace}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AgentRunning({ agentName }: { agentName: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-1.5">
      <Loader2 size={14} strokeWidth={1.5} className="text-accent animate-spin" />
      <span className="text-body-sm text-ink">{agentName} running...</span>
    </div>
  );
}
