# ClaudeOS

**The agentic operating system for enterprises.**

Every team at a company already uses AI — engineers code with copilots, sales drafts with assistants, CS summarizes with chatbots. But these AI outputs are siloed. No system connects what one team's AI produces to what another team needs.

ClaudeOS changes that. It connects to a company's data sources, maintains a shared knowledge base (the company wiki), and surfaces cross-cutting insights that no single person or agent could find alone.

This is a working prototype that demonstrates the concept with a simulated company scenario.

![Architecture](architecture-diagram.svg)

---

## The Demo

You'll see a simulated company called **Meridian** (50-person B2B SaaS, $8M ARR). Three things are happening in parallel across the company — and nobody has connected them:

1. **A customer emails** asking about a feature (rules-based alerting)
2. **An engineer posts in Slack** that he built that exact feature at a hackathon — and is looking for a beta tester
3. **The CRM flags** that same customer as at-risk, and their **$1M renewal** cancellation window closes today

Three agents each see one piece. The Connector reads the full wiki and finds the blindspot: the feature the customer wants already exists, built by AI in 2 days, sitting in a branch. Ship it now and save the renewal.

The CEO approves. The Head of Sales gets a personalized action plan. The decision is committed to git.

## How It Works

```
Data Sources → Specialized Agents → Company Wiki → The Connector → Human Decision
```

| Component | What it does |
|-----------|-------------|
| **Data Sources** | Email, Slack, CRM, spreadsheets (simulated, connected via MCP) |
| **Customer Agent** | Reads email, logs feature requests to the wiki |
| **Product Agent** | Reads Slack, updates project pages and engineer profiles |
| **Sales Agent** | Reads CRM + spreadsheets, cross-references to flag deal risks |
| **The Connector** | Reads the entire wiki, finds cross-domain blindspots (Claude Opus) |
| **Company Wiki** | Git-backed markdown knowledge base — the shared world model |

The wiki pages are pre-populated with realistic company data (people, projects, customers, deal history). When agents run, they update these pages with new information. The Connector then reads the enriched wiki and finds connections no individual agent could see.

**Everything is real.** The only pre-written content is the source data (simulated emails, Slack posts, etc.) and the wiki seed. All agent analysis, wiki updates, and blindspot synthesis are live Claude API calls.

---

## Run It Locally

### Prerequisites
- Node.js 18+
- An Anthropic API key (needs access to Claude Sonnet and Claude Opus)

### Setup

```bash
git clone https://github.com/Samagram11/claude-os.git
cd claude-os
npm install
```

Create a `.env.local` file:

```
ANTHROPIC_API_KEY=your-key-here
```

Initialize the wiki's git repo (needed for agent commits and diff tracking):

```bash
cd commons
git init
git add .
git commit -m "Initial seed" --author="System <system@claude-os.local>"
cd ..
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or whatever port is shown).

### Demo Flow

1. **Press "Go"** — watch data flow in from the left, agents light up in the middle, and wiki pages update on the right
2. **Click any node** in the flow diagram to open the file drawer and read the source data or wiki page
3. **Watch the Connector** synthesize across all signals (this takes 15-30 seconds — it's Claude Opus with extended thinking)
4. **Review the blindspot** — read the insight, expand the rationale, select a recommended action
5. **Approve** — the decision is committed to git
6. **Click "View [person]'s dashboard"** — see the personalized action plan the relevant team member receives
7. **Click "Meridian Wiki"** in the top nav to browse the full knowledge base and see what agents changed

### Reset

Press **Reset** to restore the wiki to its seed state and clear all generated files. You can run the demo again — the agents will generate fresh analysis each time.

---

## Demo 2: Roadmap Planner (Agent Teams)

The first demo shows **reactive** coordination — data flows in, agents find a blindspot. The second demo shows **proactive** coordination — a human initiates a task and an agent team collaborates to produce a deliverable.

### How to run it

1. Switch to **Lin Zhang** (Head of Product) in the user switcher
2. Press **"Plan Q3 Roadmap"**
3. Watch the agent team in action:
   - **The Planner** breaks the task into research subtasks
   - **Customer Agent**, **Product Agent**, and **Sales Agent** work in parallel — reading the wiki and reporting findings
   - Agent messages appear in real-time showing what each agent found
   - The Planner synthesizes all findings into a draft roadmap
4. The roadmap is written to the Meridian Wiki and rendered inline
5. Click **"View in wiki"** to see the full page in the file drawer

### What this demonstrates

This mirrors the **Claude Code Agent Teams** pattern:
- A **lead agent** breaks work into subtasks and assigns them
- **Domain agents** work in parallel with scoped read access to the wiki
- Agents **message their findings** back to the lead
- The lead **synthesizes** into a final deliverable
- The wiki is the **shared state** that all agents read from

### The smart connection

The roadmap prioritizes based on what the wiki knows:
- **Smart Alerts** is Priority 1 because Halcyon Health ($1M ARR) is at risk and the prototype already exists
- **Dashboard Embedding** is Priority 2 because DataBridge Co ($320K ARR) is evaluating Tableau over this gap
- If you ran Demo 1 first, the wiki is enriched with the blindspot data — making the roadmap even more informed

---

## Key Design Decisions

- **No database.** The wiki is git-tracked markdown. That IS the database.
- **No vector store / RAG.** Claude's 1M-token context reads files directly.
- **No faked outputs.** Agent signals, wiki updates, and blindspot synthesis are all live API calls.
- **Agents can only update existing wiki pages** (not create new files) — this enforces the shared-state model.
- **Git = audit trail.** Every agent write is a commit with the agent name as author. Every human decision is a commit too.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- @anthropic-ai/sdk (Claude Sonnet for domain agents, Claude Opus for the Connector)
- simple-git (git operations for the wiki)
- react-markdown (rendering wiki content)

---

## Read More

See [memo.md](memo.md) for the full thesis on why this capability matters and how it represents a $10B+ opportunity for Anthropic.
