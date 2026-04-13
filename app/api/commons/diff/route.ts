import { NextRequest, NextResponse } from "next/server";
import { getGit } from "@/lib/git";

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get("file");
  if (!filePath) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
  }

  try {
    const git = getGit();
    const log = await git.log({ file: filePath });
    const allLog = await git.log();
    const firstCommit = allLog.all[allLog.all.length - 1];

    if (!firstCommit || allLog.all.length <= 1) {
      return NextResponse.json({ additions: [], agent: null });
    }

    // Get the most recent commit that touched this file (excluding the seed)
    const recentCommit = log.all.find((c) => c.hash !== firstCommit.hash);
    const agent = recentCommit?.author_name || null;

    // Get the diff between the seed commit and current state
    const diff = await git.diff([firstCommit.hash, "HEAD", "--", filePath]);

    const additions = diff
      .split("\n")
      .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
      .map((line) => line.slice(1).trim())
      .filter((line) => line.length > 0 && !line.startsWith("---") && !line.startsWith("type:") && !line.startsWith("last_updated:") && !line.startsWith("updated_by:"));

    return NextResponse.json({ additions, agent });
  } catch {
    return NextResponse.json({ additions: [], agent: null });
  }
}
