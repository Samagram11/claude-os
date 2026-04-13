import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getGit } from "@/lib/git";

const COMMONS_PATH = path.join(process.cwd(), "commons");

async function clearDirectory(dirPath: string) {
  const fullPath = path.join(COMMONS_PATH, dirPath);
  try {
    const entries = await fs.readdir(fullPath);
    for (const entry of entries) {
      if (entry.startsWith(".")) continue;
      await fs.rm(path.join(fullPath, entry), { recursive: true });
    }
  } catch {
    // Directory may not exist
  }
}

export async function POST() {
  try {
    const git = getGit();

    // Reset wiki pages to their original seed state (first commit)
    const log = await git.log();
    const firstCommit = log.all[log.all.length - 1];
    if (firstCommit) {
      // Restore all wiki files to seed state
      await git.checkout([firstCommit.hash, "--", "wiki/"]);
    }

    // Clear generated files
    await clearDirectory("sources/email");
    await clearDirectory("sources/calendar");
    await clearDirectory("sources/slack");
    await clearDirectory("sources/sheets");
    await clearDirectory("blindspots");

    // Commit the reset
    await git.add(".");
    await git.commit("Reset: restored wiki to seed state, cleared sources and blindspots", undefined, {
      "--author": "System <system@claude-os.local>",
      "--allow-empty": null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset failed:", error);
    return NextResponse.json(
      { error: "Reset failed", details: String(error) },
      { status: 500 }
    );
  }
}
