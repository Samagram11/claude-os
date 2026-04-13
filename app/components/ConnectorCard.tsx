"use client";

import { useState } from "react";
import { Brain, Loader2, CheckCircle, AlertTriangle, ChevronDown, ChevronRight, Sparkles } from "lucide-react";

interface ConnectorCardProps {
  status: "idle" | "thinking" | "done" | "error";
  thinkingTrace: string | null;
  summary: string | null;
  errorMessage: string | null;
}

export default function ConnectorCard({
  status,
  thinkingTrace,
  summary,
  errorMessage,
}: ConnectorCardProps) {
  const [showThinking, setShowThinking] = useState(false);
  const isActive = status === "thinking";

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        isActive
          ? "border-accent/30 bg-accent/[0.03]"
          : status === "done"
            ? "border-success/20 bg-canvas"
            : "border-border-subtle bg-canvas"
      }`}
      style={{ transition: "all 300ms cubic-bezier(0.2, 0, 0, 1)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10">
            <Sparkles size={14} strokeWidth={1.5} className="text-accent" />
          </div>
          <div>
            <h3 className="text-[15px] font-medium text-ink">The Connector</h3>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Reads all signals, discovers what no single agent can see
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-[12px] ${
          isActive ? "text-accent" : status === "done" ? "text-success" : status === "error" ? "text-danger" : "text-ink-dim"
        }`}>
          {isActive && <Loader2 size={12} strokeWidth={2} className="animate-spin" />}
          {status === "done" && <CheckCircle size={12} strokeWidth={2} />}
          {status === "error" && <AlertTriangle size={12} strokeWidth={2} />}
          <span>
            {status === "idle" && "Waiting for signals"}
            {status === "thinking" && "Synthesizing across domains..."}
            {status === "done" && "Blindspot identified"}
            {status === "error" && "Failed"}
          </span>
        </div>
      </div>

      {/* Thinking animation */}
      {isActive && (
        <div className="mt-4 flex items-center gap-3 px-3 py-3 rounded-lg bg-elevated">
          <Brain size={16} strokeWidth={1.5} className="text-accent animate-pulse" />
          <div>
            <span className="text-[13px] text-ink block">Extended thinking active</span>
            <span className="text-[12px] text-ink-dim">
              Reasoning across deal, tech, people, and finance signals...
            </span>
          </div>
        </div>
      )}

      {/* Thinking trace (collapsible) */}
      {thinkingTrace && status === "done" && (
        <div className="mt-3">
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="flex items-center gap-1.5 text-[12px] text-accent hover:text-accent-hover transition-colors"
          >
            {showThinking ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <Brain size={12} strokeWidth={1.5} />
            <span>View reasoning trace</span>
          </button>
          {showThinking && (
            <pre className="mt-2 p-3 rounded-lg bg-elevated text-[11px] leading-[16px] text-ink-muted font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
              {thinkingTrace}
            </pre>
          )}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <p className="text-[13px] text-ink-muted leading-[20px]">{summary}</p>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <p className="text-[12px] text-danger">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
