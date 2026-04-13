"use client";

import { X, Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState, useCallback } from "react";

interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
}

interface FileDrawerProps {
  filePath: string | null; // null = closed, "__browse__" = file tree, anything else = file view
  onClose: () => void;
  onNavigate: (path: string) => void;
}

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
  "schema": "schema.md",
};

function TreeItem({
  node,
  depth,
  onSelect,
}: {
  node: FileTreeNode;
  depth: number;
  onSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);

  if (node.type === "directory") {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[13px] text-ink-muted hover:bg-hover transition-colors"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {expanded ? (
            <ChevronDown size={13} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          ) : (
            <ChevronRight size={13} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          )}
          {expanded ? (
            <FolderOpen size={13} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          ) : (
            <Folder size={13} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          )}
          <span>{node.name}</span>
        </button>
        {expanded && node.children?.map((child) => (
          <TreeItem key={child.path} node={child} depth={depth + 1} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[13px] text-ink-muted hover:bg-hover hover:text-ink transition-colors"
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <FileText size={13} strokeWidth={1.5} className="text-ink-dim shrink-0" />
      <span>{node.name.replace(".md", "")}</span>
    </button>
  );
}

export default function FileDrawer({ filePath, onClose, onNavigate }: FileDrawerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [additions, setAdditions] = useState<string[]>([]);
  const [diffAgent, setDiffAgent] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [tree, setTree] = useState<FileTreeNode[]>([]);

  const isBrowseMode = filePath === "__browse__";
  const isFileMode = filePath && !isBrowseMode;

  // Fetch file tree when in browse mode
  useEffect(() => {
    if (isBrowseMode) {
      fetch("/api/commons")
        .then((res) => res.json())
        .then((data) => setTree(data.tree || []))
        .catch(() => setTree([]));
    }
  }, [isBrowseMode]);

  // Fetch file content and diff when viewing a file
  useEffect(() => {
    if (!isFileMode) {
      setContent(null);
      setAdditions([]);
      return;
    }
    fetch(`/api/commons?file=${encodeURIComponent(filePath)}`)
      .then((res) => res.json())
      .then((data) => setContent(data.content || null))
      .catch(() => setContent(null));

    // Fetch diff for wiki files
    if (filePath.startsWith("wiki/")) {
      fetch(`/api/commons/diff?file=${encodeURIComponent(filePath)}`)
        .then((res) => res.json())
        .then((data) => {
          setAdditions(data.additions || []);
          setDiffAgent(data.agent || null);
        })
        .catch(() => { setAdditions([]); setDiffAgent(null); });
    } else {
      setAdditions([]);
      setDiffAgent(null);
    }
  }, [filePath, isFileMode]);

  // Reset history when drawer closes
  useEffect(() => {
    if (!filePath) {
      setHistory([]);
    }
  }, [filePath]);

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href?.startsWith("#wiki-")) return;
    e.preventDefault();
    const wikiName = href.replace("#wiki-", "");
    const resolvedPath = WIKI_PATHS[wikiName];
    if (resolvedPath && filePath) {
      setHistory((prev) => [...prev, filePath]);
      onNavigate(resolvedPath);
    }
  }, [filePath, onNavigate]);

  const handleBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      onNavigate(prev);
    } else if (isFileMode) {
      // Go back to browse mode
      onNavigate("__browse__");
    }
  };

  const handleTreeSelect = (path: string) => {
    setHistory((prev) => [...prev, "__browse__"]);
    onNavigate(path);
  };

  const prepareContent = (text: string) => {
    let cleaned = text.replace(/^---[\s\S]*?---\s*\n?/, "");
    cleaned = cleaned.replace(/\[\[([^\]]+)\]\]/g, (_, link) => `[${link}](#wiki-${link})`);
    cleaned = cleaned.replace(/(\*\*[^*]+\*\*[^\n]*)\n(\*\*)/g, "$1  \n$2");
    return cleaned;
  };

  if (!filePath) return null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative ml-auto w-[600px] h-full bg-canvas border-l border-border-subtle overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideIn 200ms cubic-bezier(0.2, 0, 0, 1)" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-canvas border-b border-border-subtle px-6 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            {(history.length > 0 || isFileMode) && (
              <button onClick={handleBack} className="text-[12px] text-accent hover:underline shrink-0">
                Back
              </button>
            )}
            <span className="text-body-sm text-ink-dim font-mono truncate">
              {isBrowseMode ? "Meridian Wiki" : filePath}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-hover transition-colors shrink-0 ml-2"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Browse mode: file tree */}
        {isBrowseMode && (
          <div className="py-3 px-3">
            {tree.map((node) => (
              <TreeItem key={node.path} node={node} depth={0} onSelect={handleTreeSelect} />
            ))}
          </div>
        )}

        {/* File mode: rendered content */}
        {isFileMode && (
          <div className="px-8 py-6" onClick={handleLinkClick}>
            {/* Highlighted update box */}
            {additions.length > 0 && (
              <div className="mb-6 rounded-lg border border-success/25 bg-success/[0.04] px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-[11px] font-medium text-success uppercase tracking-wide">
                    Recently updated{diffAgent ? ` by ${diffAgent}` : ""}
                  </span>
                </div>
                <div className="space-y-1">
                  {additions.slice(0, 8).map((line, i) => (
                    <div key={i} className="text-[12px] text-ink-muted leading-[18px] pl-3 border-l-2 border-success/30">
                      {line}
                    </div>
                  ))}
                  {additions.length > 8 && (
                    <div className="text-[11px] text-ink-dim pl-3">+{additions.length - 8} more changes</div>
                  )}
                </div>
              </div>
            )}
            {content ? (
              <article className="prose prose-invert max-w-none
                [&_h1]:font-serif [&_h1]:text-[28px] [&_h1]:leading-[36px] [&_h1]:font-medium [&_h1]:text-ink [&_h1]:mb-4
                [&_h2]:font-serif [&_h2]:text-[20px] [&_h2]:leading-[28px] [&_h2]:font-medium [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-3
                [&_h3]:font-sans [&_h3]:text-[15px] [&_h3]:font-medium [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-2
                [&_p]:text-[15px] [&_p]:leading-[24px] [&_p]:text-ink-muted [&_p]:mb-4
                [&_li]:text-[15px] [&_li]:leading-[24px] [&_li]:text-ink-muted
                [&_strong]:text-ink [&_strong]:font-medium
                [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline [&_a]:cursor-pointer
                [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-elevated [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
                [&_table]:border-collapse [&_table]:w-full
                [&_th]:text-left [&_th]:text-body-sm [&_th]:text-ink-dim [&_th]:font-medium [&_th]:pb-2 [&_th]:border-b [&_th]:border-border-subtle
                [&_td]:text-[15px] [&_td]:text-ink-muted [&_td]:py-2 [&_td]:border-b [&_td]:border-border-subtle
                [&_hr]:border-border-subtle [&_hr]:my-6
                [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-ink-muted
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {prepareContent(content)}
                </ReactMarkdown>
              </article>
            ) : (
              <p className="text-ink-dim text-body-sm">Loading...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
