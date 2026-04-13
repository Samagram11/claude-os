"use client";

import { Bell, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { BlindspotData } from "./types";
import { useCallback } from "react";

const WIKI_PATHS: Record<string, string> = {
  "smart-alerts": "wiki/projects/smart-alerts.md",
  "james-wright": "wiki/people/james-wright.md",
  "halcyon-health": "wiki/deals/halcyon-health.md",
  "priya-sharma": "wiki/people/priya-sharma.md",
  "sarah-chen": "wiki/people/sarah-chen.md",
  "customer-requests": "wiki/customer-requests.md",
  "deal-risks": "wiki/deal-risks.md",
};

interface SalesViewProps {
  blindspot: BlindspotData | null;
  committed: boolean;
  approvedOption: string | null;
  isRunning: boolean;
  onBack: () => void;
  onFileClick: (path: string) => void;
}

function WikiLink({ name, onFileClick }: { name: string; onFileClick: (path: string) => void }) {
  const path = WIKI_PATHS[name];
  if (!path) return <span className="text-ink font-medium">{name}</span>;
  return (
    <button onClick={() => onFileClick(path)} className="text-accent hover:underline font-medium">
      {name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
    </button>
  );
}

export default function SalesView({ blindspot, committed, approvedOption, isRunning, onBack, onFileClick }: SalesViewProps) {
  if (isRunning) {
    return (
      <div className="max-w-[700px] mx-auto px-8 py-12">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-8 transition-colors">
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Priya&apos;s view
        </button>
        <div className="text-center py-16">
          <Clock size={28} strokeWidth={1.5} className="text-ink-dim mx-auto mb-4" />
          <h2 className="text-h2 text-ink mb-2">Agents are running</h2>
          <p className="text-[15px] text-ink-muted">
            Claude OS is scanning company data sources. You&apos;ll be notified if anything requires your attention.
          </p>
        </div>
      </div>
    );
  }

  if (!committed && !blindspot) {
    return (
      <div className="max-w-[700px] mx-auto px-8 py-12">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-8 transition-colors">
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Priya&apos;s view
        </button>
        <div className="text-center py-16">
          <Bell size={28} strokeWidth={1.5} className="text-ink-dim mx-auto mb-4" />
          <h2 className="text-h2 text-ink mb-2">No updates yet</h2>
          <p className="text-[15px] text-ink-muted">
            You&apos;ll see notifications here when decisions are made that affect your accounts.
          </p>
        </div>
      </div>
    );
  }

  if (blindspot && !committed) {
    return (
      <div className="max-w-[700px] mx-auto px-8 py-12">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-8 transition-colors">
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Priya&apos;s view
        </button>
        <div className="rounded-xl border border-warning/30 bg-warning/[0.03] p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={16} strokeWidth={1.5} className="text-warning" />
            </div>
            <div>
              <span className="text-[11px] text-warning font-medium uppercase tracking-wide">
                Pending Decision
              </span>
              <h3 className="text-h2 text-ink mt-1 mb-2">{blindspot.title}</h3>
              <p className="text-[14px] text-ink-muted leading-relaxed mb-4">
                A cross-cutting insight has been identified about your <WikiLink name="halcyon-health" onFileClick={onFileClick} /> account.
                Priya Sharma is reviewing the options.
              </p>
              <div className="flex items-center gap-2 text-[13px] text-ink-dim">
                <Clock size={14} strokeWidth={1.5} />
                <span>Waiting for CEO review</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto px-8 py-12">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-8 transition-colors">
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Priya&apos;s view
      </button>

      <div className="rounded-xl border border-success/30 bg-success/[0.03] p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle size={16} strokeWidth={1.5} className="text-success" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-success font-medium uppercase tracking-wide">
              Action Required
            </span>
            <h3 className="text-h2 text-ink mt-1 mb-2">
              Halcyon Health — Save the Renewal
            </h3>
            <p className="text-[14px] text-ink-muted leading-relaxed mb-3">
              Priya reviewed a cross-domain analysis and approved an action plan for the <WikiLink name="halcyon-health" onFileClick={onFileClick} /> account.
            </p>

            <div className="bg-elevated rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} strokeWidth={1.5} className="text-success" />
                <span className="text-[13px] font-medium text-ink">Approved Action</span>
              </div>
              <p className="text-[14px] text-ink-muted leading-relaxed pl-[22px]">
                {approvedOption}
              </p>
            </div>

            <div className="border-t border-border-subtle pt-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight size={14} strokeWidth={1.5} className="text-accent" />
                <span className="text-[13px] font-medium text-ink">Your next steps</span>
              </div>
              <ul className="space-y-2 pl-[22px]">
                <li className="text-[13px] text-ink-muted flex items-start gap-2">
                  <span className="text-ink-dim mt-1.5 shrink-0">&#x2022;</span>
                  <span>Reach out to Rachel Park (VP Product) at Halcyon — tell her <WikiLink name="smart-alerts" onFileClick={onFileClick} /> is shipping this week</span>
                </li>
                <li className="text-[13px] text-ink-muted flex items-start gap-2">
                  <span className="text-ink-dim mt-1.5 shrink-0">&#x2022;</span>
                  <span>Schedule a demo with their team before the cancellation window closes</span>
                </li>
                <li className="text-[13px] text-ink-muted flex items-start gap-2">
                  <span className="text-ink-dim mt-1.5 shrink-0">&#x2022;</span>
                  <span>Coordinate with <WikiLink name="james-wright" onFileClick={onFileClick} /> — he built the feature and is looking for a beta customer</span>
                </li>
                <li className="text-[13px] text-ink-muted flex items-start gap-2">
                  <span className="text-ink-dim mt-1.5 shrink-0">&#x2022;</span>
                  <span>Update the <WikiLink name="deal-risks" onFileClick={onFileClick} /> page once outreach is complete</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
