import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { commitAgentWrite } from "@/lib/git";

const COMMONS_PATH = path.join(process.cwd(), "commons");

const SOURCE_FILES: Record<string, { path: string; content: string }> = {
  email: {
    path: "sources/email/halcyon-feature-request.md",
    content: `---
source: email
from: rachel.park@halcyonhealth.com
to: lin@meridian.io
cc: sarah@meridian.io
date: 2026-04-08
subject: "Question about alerting capabilities"
ingested: 2026-04-12
---

Hi Lin,

Hope you're doing well. I wanted to reach out about something that's come up in our team planning for next quarter.

We've been using Meridian's dashboards across all three of our hospital sites and the real-time data has been great. But as we've scaled, our ops team keeps asking the same question: **can we set up rules-based alerts on dashboard metrics?**

For example, our ER directors want to be notified automatically when wait times exceed 45 minutes, or when bed occupancy crosses 90%. Right now, someone has to be watching the dashboard to catch these — which defeats the purpose of real-time data.

I know this isn't a current feature, but I wanted to ask: **is this on your roadmap? Or is there a workaround we're missing?**

I'll be honest — we've been getting demos from a couple of other platforms that offer this out of the box. We're not looking to switch, but our COO is asking hard questions about whether we're getting full value from the Meridian investment, and alerting is the #1 gap she keeps pointing to.

Our renewal is coming up soon and I want to make sure we can tell a strong story internally about where the platform is headed.

Thanks,
Rachel Park
VP of Product, Halcyon Health`,
  },
  slack: {
    path: "sources/slack/james-hackathon-post.md",
    content: `---
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

The branch is \`feature/smart-alerts\` — feel free to pull it down and try it.

**I'm looking for a customer to beta test this with.** If anyone knows an account that's been asking for alerting, let me know!

---

*(no replies)*`,
  },
  calendar: {
    path: "sources/calendar/halcyon-qbr-notes.md",
    content: `---
source: calendar
type: crm-notes
account: Halcyon Health
owner: sarah-chen
date: 2026-04-03
generated_by: AI (Claude meeting transcript summary)
ingested: 2026-04-12
---

## Halcyon Health — QBR Notes (AI-Generated Summary)

**Meeting date:** April 3, 2026
**Attendees:** Sarah Chen (Meridian), David Torres (Halcyon CTO — joined 15 min late, left early)
**Missing:** Rachel Park (VP Product — declined meeting)

### AI-Generated Account Health Flag: ⚠️ AT RISK

**Key signals from this meeting:**

1. **Engagement declining.** David joined late and left 20 minutes early. He said he was "double-booked" but this is the pattern for the last two QBRs. Rachel Park (VP Product, our day-to-day champion) declined entirely — first time she's missed a QBR.

2. **Competitor mentions.** David casually referenced "some demos we've been seeing from other platforms." He didn't name anyone specifically, but said their COO has been "asking whether we're getting full value from our analytics stack."

3. **Feature gap: alerting.** David brought up alerting unprompted — said their ER directors have been asking for rules-based alerts on dashboard metrics. I told him it's not currently available but I'd check with product. He seemed disappointed.

4. **Renewal not discussed.** I intended to discuss the upcoming renewal but David left before we got to it. Renewal is May 5 — auto-renew with 30-day cancellation window.

### Recommended Actions (AI-generated)
- Escalate to [[priya-sharma]] — this is our largest account
- Check with [[lin-zhang]] on alerting roadmap timeline
- Schedule dedicated renewal conversation before cancellation window closes
- Consider executive sponsor meeting (Priya → Halcyon COO)

### Previous QBR History
- **January 2026:** Normal. David and Rachel both attended. Positive tone.
- **February 2026:** David cancelled. Rachel attended solo. She mentioned "exploring options" for the first time.
- **March 2026:** David attended 20 min late. Rachel declined. First ⚠️ flag.
- **April 2026:** This meeting. Both effectively disengaged. Upgraded to ⚠️ AT RISK.`,
  },
  sheets: {
    path: "sources/sheets/renewals-tracker.md",
    content: `---
source: sheets
document: "Q2 2026 Renewals & Revenue Tracker"
owner: finance-team
last_modified: 2026-04-10
ingested: 2026-04-12
---

## Q2 2026 Renewals & Revenue Tracker

### Upcoming Renewals (Next 60 Days)

| Customer | ARR | Renewal Date | Cancel Window | CS Health | Status |
|----------|-----|-------------|---------------|-----------|--------|
| **Halcyon Health** | **$1,000K** | **May 5** | **Opens Apr 5 — Closes Apr 12** | **Healthy** | **Auto-renew** |
| TechFlow Inc | $320K | May 15 | Apr 15 – Apr 22 | Healthy | Auto-renew |
| DataBridge Co | $180K | May 20 | Apr 20 – Apr 27 | At Risk | In discussion |
| Nexus Labs | $150K | Jun 1 | May 1 – May 8 | Healthy | Auto-renew |
| CloudPeak | $90K | Jun 10 | May 10 – May 17 | Healthy | Auto-renew |

### Revenue Summary

| Metric | Value | Notes |
|--------|-------|-------|
| Total ARR | $8.0M | 50 active customers |
| Q2 Renewals at Risk | $1.18M | Halcyon ($1M) + DataBridge ($180K) |
| Largest Single Account | Halcyon Health ($1M) | 12.5% of total ARR |
| Q3 Forecast (assumes all renew) | $9.2M | Includes $1.2M new pipeline |

### Risk Flags

⚠️ **Halcyon Health ($1M):**
- CS dashboard says "Healthy" but this hasn't been updated since Feb
- Sarah Chen flagged as at-risk in CRM notes (April 3)
- **Cancellation window closes April 12** — 2 days from now
- If Halcyon churns: 12% ARR hit, largest churn event ever, board-level concern

⚠️ **DataBridge Co ($180K):**
- Known at-risk, actively in renewal negotiation
- Likely to renew with 10% discount

### Board Impact if Halcyon Churns
- Q3 revenue forecast drops from $9.2M to $8.2M
- First major enterprise churn — signals retention problem
- Investor narrative shifts from "stable growth" to "retention concerns"
- May trigger questions about product gaps in healthcare vertical`,
  },
};

export async function POST(request: NextRequest) {
  const { source } = await request.json();

  const sourceFile = SOURCE_FILES[source as string];
  if (!sourceFile) {
    return NextResponse.json(
      { error: `Unknown source: ${source}` },
      { status: 400 }
    );
  }

  try {
    const fullPath = path.join(COMMONS_PATH, sourceFile.path);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, sourceFile.content, "utf-8");

    await commitAgentWrite(
      "Ingest",
      [sourceFile.path],
      `Ingest: ${sourceFile.path.split("/").pop()}`
    );

    return NextResponse.json({
      success: true,
      file: sourceFile.path,
    });
  } catch (error) {
    console.error(`Ingest ${source} failed:`, error);
    return NextResponse.json(
      { error: `Ingest failed`, details: String(error) },
      { status: 500 }
    );
  }
}
