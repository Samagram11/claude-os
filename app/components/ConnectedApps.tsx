"use client";

import { Mail, Calendar, MessageSquare, Table2 } from "lucide-react";

const apps = [
  { name: "Email", icon: Mail, id: "email" },
  { name: "Calendar", icon: Calendar, id: "calendar" },
  { name: "Slack", icon: MessageSquare, id: "slack" },
  { name: "Sheets", icon: Table2, id: "sheets" },
];

interface ConnectedAppsProps {
  activeSource: string | null;
}

export default function ConnectedApps({ activeSource }: ConnectedAppsProps) {
  return (
    <div className="flex items-center gap-5 px-6 py-3 border-b border-border-subtle bg-sidebar">
      <span className="text-label text-ink-dim mr-1">Sources</span>
      {apps.map((app) => {
        const Icon = app.icon;
        const isActive = activeSource === app.id;
        return (
          <div
            key={app.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors"
            style={{
              background: isActive ? "var(--color-elevated)" : "transparent",
            }}
          >
            <Icon
              size={16}
              strokeWidth={1.5}
              className={
                isActive ? "text-accent" : "text-ink-muted"
              }
              style={{
                transition: "color 120ms cubic-bezier(0.2, 0, 0, 1)",
              }}
            />
            <span
              className={`text-body-sm ${isActive ? "text-ink" : "text-ink-muted"}`}
            >
              {app.name}
            </span>
            <span className="text-[10px] text-ink-dim border border-border-subtle rounded px-1 py-0.5 leading-none">
              sim
            </span>
          </div>
        );
      })}
    </div>
  );
}
