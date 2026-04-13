"use client";

import { Bell, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BlindspotData } from "./types";
import { useCallback } from "react";

const WIKI_PATHS: Record<string, string> = {
  "smart-alerts": "wiki/projects/smart-alerts.md",
  "james-wright": "wiki/people/james-wright.md",
  "halcyon-health": "wiki/deals/halcyon-health.md",
  "priya-sharma": "wiki/people/priya-sharma.md",
  "sarah-chen": "wiki/people/sarah-chen.md",
  "lin-zhang": "wiki/people/lin-zhang.md",
  "customer-requests": "wiki/customer-requests.md",
  "deal-risks": "wiki/deal-risks.md",
};

function convertWikiLinks(text: string): string {
  return text.replace(/\[\[([^\]]+)\]\]/g, (_, link) => `[${link}](#wiki-${link})`);
}

interface ActionOwnerViewProps {
  blindspot: BlindspotData | null;
  committed: boolean;
  approvedOption: string | null;
  approvedPersonName: string | null;
  approvedOptionDetail: string | null;
  isRunning: boolean;
  onBack: () => void;
  onFileClick: (path: string) => void;
}

export default function ActionOwnerView({
  blindspot,
  committed,
  approvedOption,
  approvedPersonName,
  approvedOptionDetail,
  isRunning,
  onBack,
  onFileClick,
}: ActionOwnerViewProps) {
  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href?.startsWith("#wiki-")) return;
    e.preventDefault();
    const wikiName = href.replace("#wiki-", "");
    const resolvedPath = WIKI_PATHS[wikiName];
    if (resolvedPath) onFileClick(resolvedPath);
  }, [onFileClick]);

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
            ClaudeOS is scanning company data sources. You&apos;ll be notified if anything requires your attention.
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
            You&apos;ll see notifications here when decisions are made that affect your work.
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
                A cross-cutting insight has been identified. Priya Sharma is reviewing the options.
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
              {approvedOption}
            </h3>
            <p className="text-[14px] text-ink-muted leading-relaxed mb-3">
              Priya Sharma reviewed a cross-domain analysis and approved this action{approvedPersonName ? ` for ${approvedPersonName}` : ""}.
            </p>

            {/* Render the Connector's actual option details */}
            {approvedOptionDetail && (
              <div className="border-t border-border-subtle pt-4" onClick={handleLinkClick}>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight size={14} strokeWidth={1.5} className="text-accent" />
                  <span className="text-[13px] font-medium text-ink">Your action items</span>
                </div>
                <div className="text-[13px] text-ink-muted leading-[21px]
                  [&_p]:mb-2
                  [&_ul]:pl-4 [&_ul]:space-y-1 [&_ul]:mb-2
                  [&_li]:text-[13px] [&_li]:leading-[21px]
                  [&_strong]:text-ink [&_strong]:font-medium
                  [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline [&_a]:cursor-pointer
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {convertWikiLinks(approvedOptionDetail)}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
