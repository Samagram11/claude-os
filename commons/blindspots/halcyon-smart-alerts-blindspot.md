---
type: blindspot
severity: critical
created: 2026-04-12
agent: connector
---

# $1M Renewal Saveable Today — Working Prototype Sits Unused While Halcyon Evaluates Competitors

## Summary
[[halcyon-health]] ($1M ARR, 12.5% of revenue) has a cancellation window that closes today (April 12). Their COO has escalated a demand for rules-based alerting on dashboard metrics. Meanwhile, [[james-wright]] built a feature-complete [[smart-alerts]] prototype in March — 47 tests passing, demo video recorded — and has been searching for a beta customer for three weeks with zero responses. Sales and engineering have not connected these dots. The Q3 forecast assumes this renewal closes; losing it would drop ARR from $8M to $7M and trigger board-level retention concerns.

## The Connection
1. [[halcyon-health]] specifically requested "rules-based alerting on dashboard metrics" as of today per [[customer-requests]].
2. [[smart-alerts]] is a working prototype that delivers exactly this — threshold alerts on any dashboard metric, with email/Slack/SMS delivery — built by [[james-wright]] and architecturally approved by [[lin-zhang]].
3. [[james-wright]] posted in #engineering-hackathon on March 22 asking for a beta customer; no one replied ([[smart-alerts]]).
4. [[sarah-chen]] owns the Halcyon relationship and flagged alerting demand, but has not been briefed on the prototype ([[sarah-chen]], [[deal-risks]]).
5. [[q3-forecast]] assumes Halcyon renews at $1M; losing them would be Meridian's first major enterprise churn and a 12% ARR hit before the June 15 board meeting.
6. Halcyon's CTO David Torres has been disengaging since February — cancelled one QBR, left another early ([[halcyon-health]]).

## Recommended Actions

### Option 1: Emergency Demo Today
[[sarah-chen]] contacts Halcyon today with a live [[smart-alerts]] demo offer, looping in [[james-wright]] to run it. [[priya-sharma]] joins as exec sponsor.
- **Upside:** Directly addresses their stated need before the cancellation window closes; could save $1M ARR.
- **Risk:** Prototype is unmerged; demoing pre-release software sets expectations that must be met.

### Option 2: Commit to Beta Program with Contractual Timeline
[[lin-zhang]] approves a fast-track merge of [[smart-alerts]] with Halcyon as the named beta customer; offer a 30-day beta with dedicated support in exchange for renewal commitment.
- **Upside:** Gets customer validation [[lin-zhang]] requires to ship, saves the deal, and creates a reference case.
- **Risk:** Compresses QA timeline; any bugs in production hit Meridian's largest account.

### Option 3: Executive Hold + Roadmap Commitment
[[priya-sharma]] calls David Torres directly today to buy time — share the roadmap commitment to alerting with a firm ship date, and request a 30-day renewal extension.
- **Upside:** Buys time without shipping unvalidated code.
- **Risk:** Competitors are already demoing; a roadmap promise may not be enough to counter a live product.
