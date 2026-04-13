---
source: slack
channel: "#engineering-hackathon"
date: 2026-03-22
author: james-wright
ingested: 2026-04-12
---

## #engineering-hackathon — March 22, 2026

**james-wright** — 4:30 PM

Hey team! Sharing my hackathon project from last week 🎉

**Smart Alerts — rules-based alerting for Meridian dashboards**

Built a fully working prototype that lets users define threshold-based alerts on any dashboard metric. Here's what it does:

- **Threshold alerts**: above, below, or % change triggers
- **Multi-channel delivery**: email, Slack, and SMS notifications
- **Alert builder UI**: integrated right into the dashboard editor
- **Grouping & dedup**: smart batching so you don't get alert-stormed
- **API support**: full programmatic alert management

I used Claude to build this — went from idea to working prototype in 2 days. All tests are passing. Recorded a 5-min demo video: [link]

The branch is `feature/smart-alerts` — feel free to pull it down and try it.

**I'm looking for a customer to beta test this with.** If anyone knows an account that's been asking for alerting, let me know!

---

*(no replies)*