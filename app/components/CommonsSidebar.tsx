"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
}

interface CommonsSidebarProps {
  refreshTrigger: number;
  highlightedFiles: Set<string>;
  onFileSelect: (path: string) => void;
}

function TreeItem({
  node,
  depth,
  onSelect,
  highlightedFiles,
}: {
  node: FileTreeNode;
  depth: number;
  onSelect: (path: string) => void;
  highlightedFiles: Set<string>;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isHighlighted = highlightedFiles.has(node.path);

  const hasHighlightedChild = node.children?.some(
    (child) =>
      highlightedFiles.has(child.path) ||
      child.children?.some((gc) => highlightedFiles.has(gc.path))
  );

  useEffect(() => {
    if (hasHighlightedChild && !expanded) {
      setExpanded(true);
    }
  }, [hasHighlightedChild, expanded]);

  if (node.type === "directory") {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-body-sm text-ink-muted hover:bg-hover transition-colors"
          style={{
            paddingLeft: `${depth * 14 + 8}px`,
            transition: "background 120ms cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          {expanded ? (
            <ChevronDown size={12} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          ) : (
            <ChevronRight size={12} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          )}
          {expanded ? (
            <FolderOpen size={12} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          ) : (
            <Folder size={12} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          )}
          <span className="truncate text-[12px]">{node.name}</span>
        </button>
        {expanded && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                onSelect={onSelect}
                highlightedFiles={highlightedFiles}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={`flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-[12px] transition-all ${
        isHighlighted
          ? "text-accent"
          : "text-ink-muted hover:bg-hover"
      }`}
      style={{
        paddingLeft: `${depth * 14 + 8}px`,
        transition: "all 200ms cubic-bezier(0.2, 0, 0, 1)",
        background: isHighlighted ? "rgba(217, 119, 87, 0.08)" : undefined,
      }}
    >
      <FileText
        size={12}
        strokeWidth={1.5}
        className={`shrink-0 ${isHighlighted ? "text-accent" : "text-ink-dim"}`}
      />
      <span className="truncate">{node.name.replace(".md", "")}</span>
      {isHighlighted && (
        <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-accent" />
      )}
    </button>
  );
}

export default function CommonsSidebar({ refreshTrigger, highlightedFiles, onFileSelect }: CommonsSidebarProps) {
  const [tree, setTree] = useState<FileTreeNode[]>([]);

  const fetchTree = useCallback(async () => {
    const res = await fetch("/api/commons");
    const data = await res.json();
    setTree(data.tree || []);
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree, refreshTrigger]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border-subtle">
        <span className="text-label text-ink-dim">The Commons</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            depth={0}
            onSelect={onFileSelect}
            highlightedFiles={highlightedFiles}
          />
        ))}
      </div>
    </div>
  );
}
