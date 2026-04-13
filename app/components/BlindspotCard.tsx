"use client";

import { useState, useCallback } from "react";
import { CheckCircle, Loader2, AlertTriangle, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BlindspotData } from "./types";

const WIKI_PATHS: Record<string, string> = {
  "priya-sharma": "wiki/people/priya-sharma.md",
  "sarah-chen": "wiki/people/sarah-chen.md",
  "lin-zhang": "wiki/people/lin-zhang.md",
  "james-wright": "wiki/people/james-wright.md",
  "halcyon-health": "wiki/deals/halcyon-health.md",
  "meridian-platform": "wiki/projects/meridian-platform.md",
  "smart-alerts": "wiki/projects/smart-alerts.md",
  "q3-forecast": "wiki/finance/q3-forecast.md",
  "customer-requests": "wiki/customer-requests.md",
  "deal-risks": "wiki/deal-risks.md",
};

function extractActionSection(content: string): string | null {
  const match = content.match(/##\s*Recommended Action\b([\s\S]*?)(?=\n## |$)/i);
  return match?.[1]?.trim() || null;
}

interface BlindspotCardProps {
  blindspot: BlindspotData;
  onApprove: (option: string, personKey: string | null, personName: string | null, fullOptionText: string) => void;
  onDecline: () => void;
  isCommitting: boolean;
  committed: boolean;
  onFileClick: (path: string) => void;
  onViewPerson?: () => void;
  approvedPersonName?: string | null;
}

export default function BlindspotCard({
  blindspot,
  onApprove,
  onDecline,
  isCommitting,
  committed,
  onFileClick,
  onViewPerson,
  approvedPersonName,
}: BlindspotCardProps) {
  const [showRationale, setShowRationale] = useState(false);

  // Split content into summary (before "The Connection") and rationale
  const summaryMatch = blindspot.content.split(/\n##\s*(?:The Connection|Rationale)\b/i);
  const summaryContent = summaryMatch[0]?.trim() || blindspot.content;
  const rationaleMatch = blindspot.content.match(/##\s*(?:The Connection|Rationale)\b([\s\S]*?)(?=\n##\s*Recommended Action|$)/i);
  const rationaleContent = rationaleMatch?.[1]?.trim() || null;

  // Extract the recommended action section
  const actionSection = extractActionSection(blindspot.content);

  // Strip the options/action section from the summary display
  const summaryClean = summaryContent.split(/\n##\s*Recommended Action/i)[0]?.trim() || summaryContent;

  const prepared = summaryClean.replace(/\[\[([^\]]+)\]\]/g, (_, link) => `[${link}](#wiki-${link})`);
  const rationalePrepped = rationaleContent?.replace(/\[\[([^\]]+)\]\]/g, (_, link) => `[${link}](#wiki-${link})`) || null;
  const actionPrepped = actionSection?.replace(/\[\[([^\]]+)\]\]/g, (_, link) => `[${link}](#wiki-${link})`) || null;

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

  if (committed) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/[0.03] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} strokeWidth={1.5} className="text-success" />
            <span className="text-[14px] font-medium text-ink">Decision approved</span>
          </div>
          {onViewPerson && approvedPersonName && (
            <button
              onClick={onViewPerson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-accent border border-accent/30 hover:bg-accent/[0.05] transition-colors"
            >
              View {approvedPersonName}&apos;s dashboard
              <ArrowRight size={13} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    );
  }

  const proseStyles = `
    [&_h2]:text-[15px] [&_h2]:font-medium [&_h2]:text-ink [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:font-sans
    [&_h3]:text-[14px] [&_h3]:font-medium [&_h3]:text-ink [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-sans
    [&_p]:text-[14px] [&_p]:leading-[22px] [&_p]:text-ink-muted [&_p]:mb-3
    [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mb-3
    [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-3
    [&_li]:text-[14px] [&_li]:leading-[21px] [&_li]:text-ink-muted
    [&_strong]:text-ink [&_strong]:font-medium
    [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline [&_a]:cursor-pointer
    [&_hr]:border-border-subtle [&_hr]:my-4
  `;

  return (
    <div className="rounded-xl border border-accent/30 bg-canvas">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-start gap-2 mb-1">
          <AlertTriangle size={16} strokeWidth={1.5} className="text-accent mt-0.5 shrink-0" />
          <span className="text-[11px] text-accent font-medium uppercase tracking-wide">Needs your attention</span>
        </div>
        <h2 className="font-serif text-[22px] leading-[30px] font-medium text-ink mt-2">
          {blindspot.title}
        </h2>
      </div>

      {/* Summary */}
      <div className="px-6 py-4" onClick={handleLinkClick}>
        <article className={proseStyles}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {prepared}
          </ReactMarkdown>
        </article>
      </div>

      {/* Rationale — collapsed */}
      {rationalePrepped && (
        <div className="px-6 pb-3">
          <button
            onClick={() => setShowRationale(!showRationale)}
            className="flex items-center gap-1.5 text-[12px] text-ink-dim hover:text-ink-muted transition-colors"
          >
            {showRationale ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>Rationale</span>
          </button>
          {showRationale && (
            <div className="mt-2 pl-4 border-l-2 border-border-subtle" onClick={handleLinkClick}>
              <article className={proseStyles}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {rationalePrepped}
                </ReactMarkdown>
              </article>
            </div>
          )}
        </div>
      )}

      {/* Recommended action */}
      {actionPrepped && (
        <div className="px-6 pb-4" onClick={handleLinkClick}>
          <span className="text-label text-ink-dim block mb-2">Recommended Action</span>
          <div className="p-3 rounded-lg border border-accent/20 bg-accent/[0.03]">
            <div className={`text-[13px] leading-[20px] text-ink-muted
              [&_p]:mb-2 [&_p]:text-[13px]
              [&_ul]:pl-4 [&_ul]:space-y-1 [&_ul]:mb-2
              [&_li]:text-[13px]
              [&_strong]:text-ink [&_strong]:font-medium
              [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline [&_a]:cursor-pointer
            `}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {actionPrepped}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="px-6 py-4 border-t border-border-subtle flex gap-2">
        <button
          onClick={() => onApprove(
            blindspot.title,
            "sarah-chen",
            "Sarah Chen",
            actionSection || blindspot.content
          )}
          disabled={isCommitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[14px] font-medium transition-colors disabled:opacity-40"
          style={{ background: "var(--color-accent)", color: "#fff" }}
        >
          {isCommitting ? (
            <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
          ) : (
            <CheckCircle size={14} strokeWidth={1.5} />
          )}
          {isCommitting ? "Approving..." : "Approve & assign to Sarah Chen"}
        </button>
        <button
          onClick={onDecline}
          disabled={isCommitting}
          className="px-4 py-2.5 rounded-lg text-[13px] text-ink-muted border border-border-subtle hover:bg-hover transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
