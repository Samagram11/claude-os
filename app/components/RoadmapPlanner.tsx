"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Play, Loader2, CheckCircle, AlertTriangle, FileText, MessageSquare, Search, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  "q3-2026": "wiki/roadmaps/q3-2026.md",
};

// Convert [[wikilinks]] and also plain names to links
function linkify(text: string): string {
  // First handle [[wikilinks]]
  let result = text.replace(/\[\[([^\]]+)\]\]/g, (_, link) => `[${link}](#wiki-${link})`);
  // Then handle common entity names that should be linked
  const nameMap: Record<string, string> = {
    "Halcyon Health": "halcyon-health",
    "Smart Alerts": "smart-alerts",
    "smart alerts": "smart-alerts",
    "smart-alerts": "smart-alerts",
    "James Wright": "james-wright",
    "Sarah Chen": "sarah-chen",
    "Lin Zhang": "lin-zhang",
    "DataBridge Co": "deal-risks",
    "DataBridge": "deal-risks",
  };
  for (const [name, wikiKey] of Object.entries(nameMap)) {
    // Only link if not already inside a markdown link
    const regex = new RegExp(`(?<!\\[)\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?!\\])(?!\\()`, "g");
    result = result.replace(regex, `[${name}](#wiki-${wikiKey})`);
  }
  return result;
}

interface ResearchResult {
  id: string;
  agentName: string;
  output: string;
  filesRead: string[];
  error: string | null;
}

interface TaskState {
  id: string;
  agentName: string;
  description: string;
  status: "pending" | "running" | "done" | "error";
}

interface AgentMsg {
  id: string;
  type: "read" | "finding" | "handoff";
  from: string;
  to?: string;
  text: string;
}

const INITIAL_TASKS: TaskState[] = [
  { id: "customer", agentName: "Customer Agent", description: "Gather top customer feature requests", status: "pending" },
  { id: "product", agentName: "Product Agent", description: "Assess engineering capacity and prototypes", status: "pending" },
  { id: "sales", agentName: "Sales Agent", description: "Identify revenue-critical accounts and risks", status: "pending" },
  { id: "synthesize", agentName: "The Planner", description: "Draft Q3 roadmap from all findings", status: "pending" },
];

interface RoadmapPlannerProps {
  onFileClick: (path: string) => void;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function RoadmapPlanner({ onFileClick }: RoadmapPlannerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<TaskState[]>(INITIAL_TASKS);
  const [messages, setMessages] = useState<AgentMsg[]>([]);
  const [roadmapContent, setRoadmapContent] = useState<string | null>(null);
  const [roadmapFile, setRoadmapFile] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateTask = (id: string, updates: Partial<TaskState>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const addMsg = (msg: Omit<AgentMsg, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }]);
  };

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

  const runPlanning = async () => {
    setIsRunning(true);
    setTasks(INITIAL_TASKS);
    setMessages([]);
    setRoadmapContent(null);
    setRoadmapFile(null);

    // Planner assigns tasks
    addMsg({ type: "handoff", from: "The Planner", to: "Team", text: "Breaking down Q3 roadmap planning into research tasks..." });
    await delay(600);
    addMsg({ type: "handoff", from: "The Planner", to: "Customer Agent", text: "Gather the top customer feature requests — what are customers asking for?" });
    await delay(300);
    addMsg({ type: "handoff", from: "The Planner", to: "Product Agent", text: "Check engineering capacity — what prototypes exist? What's ready to ship?" });
    await delay(300);
    addMsg({ type: "handoff", from: "The Planner", to: "Sales Agent", text: "Which accounts are at risk? What features would save those renewals?" });
    await delay(400);

    // Start research tasks
    updateTask("customer", { status: "running" });
    updateTask("product", { status: "running" });
    updateTask("sales", { status: "running" });

    addMsg({ type: "read", from: "Customer Agent", text: "Reading customer-requests.md..." });
    addMsg({ type: "read", from: "Product Agent", text: "Reading smart-alerts.md, meridian-platform.md..." });
    addMsg({ type: "read", from: "Sales Agent", text: "Reading deal-risks.md, halcyon-health.md..." });

    // Make the API call
    const res = await fetch("/api/roadmap", { method: "POST" });
    const data = await res.json();

    if (data.error) {
      updateTask("customer", { status: "error" });
      updateTask("product", { status: "error" });
      updateTask("sales", { status: "error" });
      addMsg({ type: "finding", from: "System", text: `Error: ${data.details || data.error}` });
      setIsRunning(false);
      return;
    }

    // Show research results one at a time
    for (const result of (data.research as ResearchResult[])) {
      if (result.error) {
        updateTask(result.id, { status: "error" });
        addMsg({ type: "finding", from: result.agentName, to: "The Planner", text: `Error: ${result.error}` });
      } else {
        updateTask(result.id, { status: "done" });

        if (result.filesRead.length > 0) {
          addMsg({
            type: "read",
            from: result.agentName,
            text: `Read ${result.filesRead.map((f) => f.split("/").pop()).join(", ")}`,
          });
        }
        await delay(300);

        addMsg({
          type: "finding",
          from: result.agentName,
          to: "The Planner",
          text: result.output,
        });
      }
      await delay(500);
    }

    // Planner synthesizes
    await delay(400);
    addMsg({ type: "handoff", from: "The Planner", to: "Team", text: "All research complete. Synthesizing into Q3 roadmap..." });
    updateTask("synthesize", { status: "running" });
    await delay(800);
    updateTask("synthesize", { status: "done" });

    // Try to load the roadmap
    const roadmapPath = data.roadmapFile || "wiki/roadmaps/q3-2026.md";
    try {
      const fileRes = await fetch(`/api/commons?file=${encodeURIComponent(roadmapPath)}`);
      const fileData = await fileRes.json();
      if (fileData.content) {
        setRoadmapFile(roadmapPath);
        setRoadmapContent(fileData.content.replace(/^---[\s\S]*?---\s*\n?/, ""));
        addMsg({ type: "finding", from: "The Planner", to: "Lin Zhang", text: "Q3 roadmap draft is ready for your review." });
      } else {
        addMsg({ type: "finding", from: "The Planner", text: "Roadmap synthesis complete. See output below." });
        // Use the planner's text output as fallback
        if (data.plannerOutput) {
          setRoadmapContent(data.plannerOutput);
        }
      }
    } catch {
      if (data.plannerOutput) {
        setRoadmapContent(data.plannerOutput);
        addMsg({ type: "finding", from: "The Planner", text: "Roadmap synthesis complete." });
      }
    }

    setIsRunning(false);
  };

  const hasResults = tasks.some((t) => t.status === "done");

  const proseStyles = `
    [&_h1]:font-serif [&_h1]:text-[22px] [&_h1]:leading-[30px] [&_h1]:font-medium [&_h1]:text-ink [&_h1]:mb-4
    [&_h2]:text-[15px] [&_h2]:font-medium [&_h2]:text-ink [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:font-sans
    [&_h3]:text-[14px] [&_h3]:font-medium [&_h3]:text-ink [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-sans
    [&_p]:text-[14px] [&_p]:leading-[22px] [&_p]:text-ink-muted [&_p]:mb-3
    [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-3
    [&_li]:text-[14px] [&_li]:leading-[21px] [&_li]:text-ink-muted
    [&_strong]:text-ink [&_strong]:font-medium
    [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline [&_a]:cursor-pointer
  `;

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[28px] leading-[36px] font-medium text-ink mb-2">Roadmap Planner</h1>
        <p className="text-[14px] text-ink-muted">
          An agent team collaborates to draft the Q3 roadmap — pulling from customer requests, engineering capacity, and deal risks in the Meridian Wiki.
        </p>
      </div>

      {/* Start button */}
      {!isRunning && !hasResults && (
        <button
          onClick={runPlanning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-medium transition-colors mb-8"
          style={{ background: "var(--color-accent)", color: "#fff" }}
        >
          <Play size={14} strokeWidth={1.5} fill="currentColor" />
          Plan Q3 Roadmap
        </button>
      )}

      {/* Two columns: task board + messages */}
      {(isRunning || hasResults) && (
        <div className="flex gap-6 mb-8">
          {/* Task Board */}
          <div className="w-[220px] shrink-0">
            <span className="text-label text-ink-dim block mb-3">Shared Task List</span>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-lg border p-3 transition-all ${
                    task.status === "running" ? "border-accent/30 bg-accent/[0.04]"
                      : task.status === "done" ? "border-success/25 bg-success/[0.03]"
                      : task.status === "error" ? "border-danger/25 bg-danger/[0.03]"
                      : "border-border-subtle bg-sidebar"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[12px] font-medium ${task.status === "done" || task.status === "running" ? "text-ink" : "text-ink-dim"}`}>
                      {task.agentName}
                    </span>
                    {task.status === "running" && <Loader2 size={11} strokeWidth={2} className="text-accent animate-spin" />}
                    {task.status === "done" && <CheckCircle size={11} strokeWidth={1.5} className="text-success" />}
                    {task.status === "error" && <AlertTriangle size={11} strokeWidth={1.5} className="text-danger" />}
                  </div>
                  <span className="text-[11px] text-ink-dim block">{task.description}</span>
                  {task.id === "synthesize" && task.status === "pending" && (
                    <span className="text-[10px] text-ink-dim/50 block mt-1">Waiting for research</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Agent Messages */}
          <div className="flex-1 min-w-0">
            <span className="text-label text-ink-dim block mb-3">Agent Communication</span>
            <div className="space-y-2 max-h-[500px] overflow-y-auto" onClick={handleLinkClick}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg ${
                    msg.type === "finding" ? "bg-elevated" : ""
                  }`}
                  style={{ animation: "fadeSlideIn 300ms cubic-bezier(0.2, 0, 0, 1)" }}
                >
                  {msg.type === "read" && <Search size={12} strokeWidth={1.5} className="text-ink-dim mt-0.5 shrink-0" />}
                  {msg.type === "finding" && <MessageSquare size={12} strokeWidth={1.5} className="text-accent mt-0.5 shrink-0" />}
                  {msg.type === "handoff" && <ArrowRight size={12} strokeWidth={1.5} className="text-ink-dim mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[11px] font-medium ${msg.type === "finding" ? "text-accent" : "text-ink-dim"}`}>
                        {msg.from}
                      </span>
                      {msg.to && (
                        <>
                          <span className="text-[10px] text-ink-dim">→</span>
                          <span className="text-[11px] text-ink-dim">{msg.to}</span>
                        </>
                      )}
                    </div>
                    <div className={`text-[12px] leading-[18px] ${msg.type === "finding" ? "text-ink-muted" : "text-ink-dim"}
                      [&_ul]:pl-4 [&_ul]:space-y-0.5 [&_ul]:mt-1
                      [&_li]:text-[12px] [&_li]:leading-[18px]
                      [&_p]:mb-1
                      [&_strong]:text-ink [&_strong]:font-medium
                      [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline [&_a]:cursor-pointer
                    `}>
                      {msg.type === "finding" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{linkify(msg.text)}</ReactMarkdown>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center gap-2 px-3 py-2">
                  <Loader2 size={11} strokeWidth={2} className="text-accent animate-spin" />
                  <span className="text-[11px] text-ink-dim">Agents working...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Output */}
      {roadmapContent && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label text-ink-dim">Draft Roadmap</span>
            {roadmapFile && (
              <button
                onClick={() => onFileClick(roadmapFile)}
                className="flex items-center gap-1 text-[12px] text-accent hover:underline"
              >
                <FileText size={11} strokeWidth={1.5} />
                View in wiki
              </button>
            )}
          </div>
          <div className="rounded-xl border border-accent/30 bg-canvas p-6" onClick={handleLinkClick}>
            <article className={proseStyles}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {linkify(roadmapContent)}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      )}

    </div>
  );
}
