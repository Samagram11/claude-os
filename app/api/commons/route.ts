import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const COMMONS_PATH = path.join(process.cwd(), "commons");

interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
}

async function buildFileTree(dirPath: string, relativeTo: string): Promise<FileTreeNode[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nodes: FileTreeNode[] = [];

  const sorted = entries
    .filter((e) => !e.name.startsWith("."))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  for (const entry of sorted) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(relativeTo, fullPath);

    if (entry.isDirectory()) {
      const children = await buildFileTree(fullPath, relativeTo);
      nodes.push({
        name: entry.name,
        path: relPath,
        type: "directory",
        children,
      });
    } else if (entry.name.endsWith(".md")) {
      nodes.push({
        name: entry.name,
        path: relPath,
        type: "file",
      });
    }
  }

  return nodes;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filePath = searchParams.get("file");

  if (filePath) {
    const fullPath = path.join(COMMONS_PATH, filePath);
    if (!fullPath.startsWith(COMMONS_PATH)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    try {
      const content = await fs.readFile(fullPath, "utf-8");
      return NextResponse.json({ content, path: filePath });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  try {
    const tree = await buildFileTree(COMMONS_PATH, COMMONS_PATH);
    return NextResponse.json({ tree });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read commons", details: String(error) },
      { status: 500 }
    );
  }
}
