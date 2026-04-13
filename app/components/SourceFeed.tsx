"use client";

import { Mail, MessageSquare, Calendar, Table2 } from "lucide-react";

export interface SourceEvent {
  id: string;
  sourceType: "email" | "slack" | "calendar" | "sheets";
  title: string;
  preview: string;
  person: string;
  timestamp: string;
  file?: string;
}

const SOURCE_ICONS = {
  email: Mail,
  slack: MessageSquare,
  calendar: Calendar,
  sheets: Table2,
};

const SOURCE_LABELS = {
  email: "Email",
  slack: "Slack",
  calendar: "CRM",
  sheets: "Spreadsheet",
};

interface SourceFeedProps {
  events: SourceEvent[];
  onFileClick: (path: string) => void;
}

export default function SourceFeed({ events, onFileClick }: SourceFeedProps) {
  if (events.length === 0) return null;

  return (
    <div>
      <span className="text-label text-ink-dim block mb-3">Data Sources</span>
      <div className="space-y-3">
        {events.map((event) => {
          const Icon = SOURCE_ICONS[event.sourceType];
          return (
            <button
              key={event.id}
              onClick={() => event.file && onFileClick(event.file)}
              className="w-full text-left rounded-lg border border-border-subtle p-3 hover:bg-hover transition-all"
              style={{ animation: "fadeSlideIn 300ms cubic-bezier(0.2, 0, 0, 1)" }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon size={13} strokeWidth={1.5} className="text-ink-dim shrink-0" />
                <span className="text-[11px] text-ink-dim uppercase tracking-wide">
                  {SOURCE_LABELS[event.sourceType]}
                </span>
                <span className="text-[11px] text-ink-dim ml-auto">{event.timestamp}</span>
              </div>
              <div className="text-[13px] font-medium text-ink mb-1">{event.title}</div>
              <div className="text-[12px] text-ink-muted leading-[18px] line-clamp-2">
                {event.preview}
              </div>
              <div className="text-[11px] text-ink-dim mt-1.5">
                {event.person}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Pre-defined source events with previews
export const SOURCE_EVENTS: { source: string; event: Omit<SourceEvent, "id"> }[] = [
  {
    source: "email",
    event: {
      sourceType: "email",
      title: "Customer asking about alerting",
      preview: "Can we set up rules-based alerts on dashboard metrics? We've been getting demos from other platforms that offer this out of the box...",
      person: "Rachel Park, VP Product at Halcyon Health",
      timestamp: "Apr 8",
      file: "sources/email/halcyon-feature-request.md",
    },
  },
  {
    source: "slack",
    event: {
      sourceType: "slack",
      title: "Hackathon project: Smart Alerts",
      preview: "Built a fully working prototype that lets users define threshold-based alerts on any dashboard metric. Looking for a customer to beta test...",
      person: "James Wright in #engineering-hackathon",
      timestamp: "Mar 22",
      file: "sources/slack/james-hackathon-post.md",
    },
  },
  {
    source: "calendar",
    event: {
      sourceType: "calendar",
      title: "Halcyon Health flagged as at-risk",
      preview: "AI-generated health flag: engagement declining, competitor mentions, CTO cancelled last two QBRs. VP Product declined meeting for first time.",
      person: "Sarah Chen — QBR notes (AI-generated)",
      timestamp: "Apr 3",
      file: "sources/calendar/halcyon-qbr-notes.md",
    },
  },
  {
    source: "sheets",
    event: {
      sourceType: "sheets",
      title: "Renewal window closing in 2 days",
      preview: "$1M ARR auto-renews May 5. Cancellation window closes April 12 — 2 days from now. CS dashboard still shows 'Healthy'.",
      person: "Revenue & Renewals Tracker",
      timestamp: "Apr 10",
      file: "sources/sheets/renewals-tracker.md",
    },
  },
];
