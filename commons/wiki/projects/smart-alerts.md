---
type: project
last_updated: 2026-03-25
updated_by: james-wright
---

# Smart Alerts
**Status:** Prototype complete
**Built by:** [[james-wright]], with contributions from [[lin-zhang]] (spec review)
**Created:** March 2026 hackathon
**Branch:** `feature/smart-alerts`

## Overview
Rules-based alerting system for the [[meridian-platform]]. Lets users define threshold-based alerts on any dashboard metric (e.g., "notify me when ER wait times exceed 45 minutes").

## Capabilities
- Threshold alerts (above/below/percentage change)
- Multi-channel delivery (email, Slack, SMS)
- Alert grouping and deduplication
- Dashboard-integrated alert builder UI
- API for programmatic alert management

## Technical Status
- Working prototype in branch `feature/smart-alerts`
- 47 tests passing, 0 failing
- Demo video recorded (shared in #engineering-hackathon)
- Built using Claude Code — went from idea to working prototype in 2 days
- Needs product review and approval from [[lin-zhang]] to merge to main

## Development History
- **Mar 18:** [[james-wright]] started hackathon build
- **Mar 20:** Core alerting engine complete, tests green
- **Mar 21:** Dashboard UI integration, multi-channel delivery
- **Mar 22:** Demo video recorded, posted in #engineering-hackathon
- **Mar 25:** [[lin-zhang]] reviewed spec, approved architecture. Merge blocked pending customer validation.

## Pull Requests
- `#247` — Core alerting engine (merged to feature branch)
- `#251` — Dashboard alert builder UI (merged to feature branch)
- `#253` — Multi-channel notification delivery (merged to feature branch)
- `#258` — API endpoints for alert management (merged to feature branch)

## Notes
- Most requested feature from enterprise customers per Q1 feedback survey
- No customer beta tester identified yet
- No one from sales has reviewed or been briefed on this capability
