"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
}

interface CommonsViewerProps {
  refreshTrigger: number;
  highlightedFiles: Set<string>;
}

function TreeItem({
  node,
  depth,
  selectedFile,
  onSelect,
  highlightedFiles,
}: {
  node: FileTreeNode;
  depth: number;
  selectedFile: string | null;
  onSelect: (path: string) => void;
  highlightedFiles: Set<string>;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = selectedFile === node.path;
  const isHighlighted = highlightedFiles.has(node.path);

  // Auto-expand directories that contain highlighted files
  const hasHighlightedChild = node.children?.some(
    (child) =>
      highlightedFiles.has(child.path) ||
      (child.children?.some((gc) => highlightedFiles.has(gc.path)))
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
            paddingLeft: `${depth * 16 + 8}px`,
            transition: "background 120ms cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          {expanded ? (
            <ChevronDown size={14} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          ) : (
            <ChevronRight size={14} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          )}
          {expanded ? (
            <FolderOpen size={14} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          ) : (
            <Folder size={14} strokeWidth={1.5} className="text-ink-dim shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {expanded && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedFile={selectedFile}
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
      className={`flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-body-sm transition-all ${
        isSelected
          ? "bg-elevated text-ink"
          : isHighlighted
            ? "text-accent"
            : "text-ink-muted hover:bg-hover"
      }`}
      style={{
        paddingLeft: `${depth * 16 + 8}px`,
        transition: "all 200ms cubic-bezier(0.2, 0, 0, 1)",
        background: isHighlighted && !isSelected
          ? "rgba(217, 119, 87, 0.08)"
          : undefined,
      }}
    >
      <FileText
        size={14}
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

export default function CommonsViewer({ refreshTrigger, highlightedFiles }: CommonsViewerProps) {
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    const res = await fetch("/api/commons");
    const data = await res.json();
    setTree(data.tree || []);
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree, refreshTrigger]);

  const handleSelect = async (filePath: string) => {
    setSelectedFile(filePath);
    const res = await fetch(`/api/commons?file=${encodeURIComponent(filePath)}`);
    const data = await res.json();
    setFileContent(data.content || null);
  };

  const renderWikiLinks = (text: string) => {
    return text.replace(/\[\[([^\]]+)\]\]/g, (_, link) => {
      return `[${link}](#wiki-${link})`;
    });
  };

  return (
    <div className="flex h-full">
      {/* File tree sidebar */}
      <div className="w-[240px] shrink-0 border-r border-border-subtle overflow-y-auto py-3 px-2">
        <span className="text-label text-ink-dim px-2 mb-2 block">
          The Commons
        </span>
        {tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            depth={0}
            selectedFile={selectedFile}
            onSelect={handleSelect}
            highlightedFiles={highlightedFiles}
          />
        ))}
      </div>

      {/* File viewer */}
      <div className="flex-1 overflow-y-auto p-8">
        {selectedFile && fileContent ? (
          <div>
            <div className="text-body-sm text-ink-dim mb-4 font-mono">
              commons/{selectedFile}
            </div>
            <article className="prose prose-invert max-w-none
              [&_h1]:font-serif [&_h1]:text-[28px] [&_h1]:leading-[36px] [&_h1]:font-medium [&_h1]:text-ink [&_h1]:mb-4
              [&_h2]:font-serif [&_h2]:text-[20px] [&_h2]:leading-[28px] [&_h2]:font-medium [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-3
              [&_h3]:font-sans [&_h3]:text-[15px] [&_h3]:font-medium [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-2
              [&_p]:text-[15px] [&_p]:leading-[24px] [&_p]:text-ink-muted [&_p]:mb-4
              [&_li]:text-[15px] [&_li]:leading-[24px] [&_li]:text-ink-muted
              [&_strong]:text-ink [&_strong]:font-medium
              [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline
              [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-elevated [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
              [&_table]:border-collapse [&_table]:w-full
              [&_th]:text-left [&_th]:text-body-sm [&_th]:text-ink-dim [&_th]:font-medium [&_th]:pb-2 [&_th]:border-b [&_th]:border-border-subtle
              [&_td]:text-[15px] [&_td]:text-ink-muted [&_td]:py-2 [&_td]:border-b [&_td]:border-border-subtle
              [&_hr]:border-border-subtle [&_hr]:my-6
              [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-ink-muted
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {renderWikiLinks(fileContent)}
              </ReactMarkdown>
            </article>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-ink-dim text-body-sm">
              Select a file to view
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
