# The Commons — Schema & Conventions

## What is The Commons?
The Commons is a shared knowledge base maintained by both humans and AI agents. It follows the LLMWiki pattern: a git-tracked collection of markdown files that serves as the company's living world model.

## Structure

### Three Layers
1. **Sources** (`/sources/`) — Raw ingested data from external systems. Immutable once written. Never edited by agents or humans after creation.
2. **Wiki** (`/wiki/`) — Agent-maintained knowledge pages about entities (people, projects, deals, systems, finance). Updated as new information arrives.
3. **Signals & Blindspots** (`/signals/`, `/blindspots/`) — Agent-generated findings and cross-cutting insights.

### Naming Conventions
- File names: lowercase, hyphenated (`priya-sharma.md`, `acme-corp.md`)
- One entity per file
- Use `[[wikilinks]]` to cross-reference between pages (e.g., `[[priya-sharma]]`, `[[analytics-dashboard]]`)

### Required Frontmatter
Every wiki page must include:
```
---
type: person | project | deal | system | finance
last_updated: YYYY-MM-DD
updated_by: human | agent-name
---
```

### Signal Format
Signals written by domain agents:
```
---
type: signal
domain: deals | tech | people | finance
severity: low | medium | high | critical
source_files: [list of source files read]
created: YYYY-MM-DD
agent: agent-name
---
```

### Blindspot Format
Cross-cutting insights from The Connector:
```
---
type: blindspot
severity: critical
signals: [list of signal files synthesized]
created: YYYY-MM-DD
agent: connector
---
```

## Agent Rules
1. Agents MUST read source files before writing signals
2. Agents MUST only write to their designated output directories
3. Agents MUST link to source evidence via `[[wikilinks]]`
4. The Connector MUST read all signals before writing a blindspot
5. All writes are git-committed with agent attribution
6. Wiki pages should be updated, not duplicated — check if a page exists before creating a new one

## Wikilink Resolution
`[[filename]]` resolves to the first matching `.md` file in the wiki. For disambiguation, use `[[deals/acme-corp]]` with the subdirectory prefix.
