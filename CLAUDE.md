# Claude OS — Prototype

## What this is
A working prototype of "Claude OS" — a multi-agent system that monitors a company's data sources (email, calendar, Slack, spreadsheets), maintains a shared world model (LLMWiki-style markdown knowledge base called "The Commons"), and surfaces critical cross-cutting insights ("blindspots") that no single person or agent could find alone.

## The demo scenario
A simulated 6-person startup. Four domain agents each see one piece of a developing crisis:
1. **Deal Watcher** — finds a $2M deal with a hard June 1 deadline
2. **Tech Radar** — finds an engineering bottleneck that blocks delivery
3. **People Signal** — finds that the only engineer who can fix it is unavailable (conference travel)
4. **Finance Watch** — finds that Q2 board projections depend on this deal

No single agent sees the full picture. A fifth agent (**The Connector**) reads across all four signals and discovers the causal chain = the Blindspot.

The human sees one item in their **Judgment Inbox**: the synthesized risk + 3 options. They approve one. It's committed to git with full attribution.

## Architecture

```
Next.js App (App Router) + Tailwind
├── /commons/                    ← git repo, LLMWiki world model
│   ├── schema.md                ← wiki conventions & agent rules
│   ├── index.md                 ← master catalog
│   ├── log.md                   ← append-only action log
│   ├── /sources/                ← raw ingested data (simulated)
│   │   ├── /email/
│   │   ├── /calendar/
│   │   ├── /slack/
│   │   └── /sheets/
│   ├── /wiki/                   ← agent-maintained world model
│   │   ├── /people/
│   │   ├── /projects/
│   │   ├── /deals/
│   │   ├── /systems/
│   │   └── /finance/
│   ├── /signals/                ← domain agent findings
│   └── /blindspots/             ← connector synthesis
│
├── app/
│   ├── page.tsx                 ← main 3-panel layout
│   ├── components/
│   │   ├── ActivityLog.tsx      ← left panel: agent activity stream
│   │   ├── CommonsViewer.tsx    ← center: file tree + markdown viewer
│   │   ├── JudgmentInbox.tsx    ← right panel: decisions queue
│   │   └── ConnectedApps.tsx    ← top bar: source app icons
│   └── api/
│       ├── agents/              ← POST routes to run each agent
│       ├── commons/             ← GET file tree, GET file content
│       └── commit/              ← POST to git commit a decision
│
├── lib/
│   ├── agents.ts                ← shared agent runner (Anthropic SDK)
│   ├── prompts/                 ← system prompts per agent
│   └── git.ts                   ← simple-git wrapper
│
└── commons/                     ← The Commons (LLMWiki, git-tracked)
```

## Key decisions
- **No database.** The Commons is a git repo of markdown files. That IS the database.
- **No vector store / RAG.** Claude's 1M context reads the files directly.
- **No auth.** Single-viewer prototype.
- **No real external integrations.** Sources (email, calendar, Slack, sheets) are simulated. The filesystem MCP serves The Commons.
- **One "Go" button** triggers the full cascade: ingest → domain agents → connector → inbox.
- **LLMWiki pattern** (Karpathy): 3 layers — raw sources (immutable), wiki (agent-maintained), schema (conventions).
- **Commons is just a folder** — it's Obsidian-compatible by default (markdown + wikilinks) but we don't depend on Obsidian.

## Style
Follow `styleguide.md` exactly. Dark theme only. Warm off-black surfaces, serif display type for headings, sans for UI. Single coral accent (`#D97757`). No gradients, no shadows, no illustrations. Massive negative space.

## Stack
- Next.js 15 (App Router)
- Tailwind CSS
- @anthropic-ai/sdk (agent calls)
- simple-git (git operations)
- react-markdown + remark-wiki-link (rendering)
- Lucide icons (stroke-based, 1.5px)

## Agent runtime
Each domain agent is a Claude API call with:
- A scoped system prompt (what it can read, what it should look for)
- Tools: `read_file`, `write_file`, `list_files` (scoped to its domain in /commons/)
- Model: claude-sonnet-4-6 (fast, cheap for domain scans) or claude-opus-4-6 (for Connector)
- The Connector gets extended thinking ON (visible in the UI — this is the demo moment)

## Git conventions
- Every agent write = a git commit with the agent name as author
- Every human judgment = a git commit with the human as author
- `git log` = full audit trail

## Build plan

### Task 1: Scaffold Next.js app with Tailwind and dependencies
Create Next.js 15 app with App Router. Install: tailwind, @anthropic-ai/sdk, simple-git, react-markdown, remark-wiki-link, lucide-react. Configure tailwind.config with styleguide.md tokens. Set up global CSS with design system variables.

### Task 2: Seed The Commons — LLMWiki world model
Create /commons/ folder with git init. Write all seed files:
- schema.md, index.md, log.md
- /wiki/people/ (priya-sharma.md, lisa-chen.md, marcus-johnson.md, james-wright.md, dan-kim.md, sarah-lopez.md)
- /wiki/projects/analytics-dashboard.md
- /wiki/deals/acme-corp.md
- /wiki/systems/event-streaming.md
- /wiki/finance/q2-projections.md
All cross-linked with [[wikilinks]]. Rich enough to feel like a real company.

### Task 3: Write simulated source files
Create /commons/sources/ with simulated ingest data:
- /email/acme-deal-confirmation.md
- /calendar/priya-reactconf-may.md
- /slack/marcus-standup-0410.md
- /sheets/q2-projections.md
Each should feel like a real raw source with metadata (from, date, subject).

### Task 4: Build Commons file tree and markdown viewer
Center panel. FileTree (recursive dir listing, Lucide icons) + FileViewer (react-markdown, [[wikilinks]] as clickable internal links). Follow styleguide.md.

### Task 5: Build agent runner with Anthropic SDK
lib/agents.ts — shared function: takes system prompt + allowed paths, provides read_file/write_file/list_files tools, calls Claude. API routes: POST /api/agents/{deal-watcher,tech-radar,people-signal,connector}.

### Task 6: Write system prompts for all 5 agents
lib/prompts/ — 5 prompts:
1. deal-watcher — reads /sources/email/, writes /signals/deals/
2. tech-radar — reads /sources/slack/, writes /signals/tech/
3. people-signal — reads /sources/calendar/, writes /signals/people/
4. finance-watch — reads /sources/sheets/, writes /signals/finance/
5. connector — reads /signals/*, writes /blindspots/

### Task 7: Build the "Go" button cascade
Single button triggers: ingest animation → 4 domain agents → Connector → populate Judgment Inbox. Activity Log and file tree update as agents run.

### Task 8: Build Activity Log panel
Left panel. [icon] [timestamp] [message]. Green/yellow/red color coding. Shows files read/written. Connector shows extended thinking trace.

### Task 9: Build Judgment Inbox panel
Right panel. Empty until blindspot found. Shows: Blindspot Report, evidence chain (clickable links to signals), 3 option cards with tradeoffs, Approve → git commit, Decline → discard.

### Task 10: Build Connected Apps bar
Top bar showing Email, Calendar, Slack, Sheets icons. "Simulated" badges. Light up during Go cascade as each source is ingested.

### Task 11: Polish and test end-to-end
Full Go → ingest → agents → connector → inbox → approve flow. Styleguide compliance. Loading states. Git audit trail works.
