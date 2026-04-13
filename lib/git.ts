import simpleGit from "simple-git";
import path from "path";

const COMMONS_PATH = path.join(process.cwd(), "commons");

export function getGit() {
  return simpleGit(COMMONS_PATH);
}

export async function initCommonsRepo() {
  const git = getGit();
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    await git.init();
    await git.add(".");
    await git.commit("Initial Commons seed");
  }
  return git;
}

export async function commitAgentWrite(
  agentName: string,
  files: string[],
  message: string
) {
  const git = getGit();
  for (const file of files) {
    await git.add(file);
  }
  await git.commit(message, undefined, {
    "--author": `${agentName} <${agentName}@claude-os.local>`,
  });
}

export async function commitHumanDecision(
  decision: string,
  files: string[]
) {
  const git = getGit();
  for (const file of files) {
    await git.add(file);
  }
  await git.commit(`Human judgment: ${decision}`, undefined, {
    "--author": "Human Operator <human@claude-os.local>",
  });
}

export async function getLog(maxCount: number = 20) {
  const git = getGit();
  return git.log({ maxCount });
}
