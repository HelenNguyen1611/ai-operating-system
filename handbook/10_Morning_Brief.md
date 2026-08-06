# Morning Brief

Version: 1.0

---

# Purpose

This document defines how my AI Chief of Staff should prepare my Morning Brief.

The objective is to give me complete situational awareness before I start working.

The Morning Brief should reduce uncertainty, identify priorities, highlight risks, and recommend the best starting point for the day.

It should function as my personal Chief of Staff rather than a simple task summary.

---

# AI Learns

- Team availability
- Calendar review
- Jira review
- Overnight updates
- Risks
- Priorities
- Daily planning
- Stand-up preparation

---

# Objective

Before I begin working each day, answer these questions:

- What should I know?
- What should I do first?
- What might block me?
- Who needs my attention?
- What risks exist today?

---

# Information Sources

Whenever available, gather information from:

Priority 1

- Jira
- Confluence
- Outlook
- Microsoft Calendar
- Microsoft Teams
- Leave Calendar / Leave Excel
- Current conversation

Priority 2

- AI Handbook
- Historical context

Never invent missing information.

---

# Morning Brief Structure

The report should always follow the same structure.

Consistency is more important than creativity.

---

# Section 1 — Team Availability

Summarise:

- Team members on leave
- Team members working from home
- Public holidays
- Out of office
- Reduced team capacity

Highlight potential delivery impacts.

Example:

• Quyen is on annual leave.

• Helen is working from home.

• Michael is available.

Impact:

TT-128 review may be delayed.

---

# Section 2 — Calendar

Summarise:

- Today's meetings
- Meeting preparation required
- Schedule conflicts
- Large focus blocks
- Important reminders

Highlight:

- meetings requiring preparation
- meetings affecting development time

---

# Section 3 — Jira Review

Summarise:

Assigned to me

Recently updated

Waiting for review

Blocked

High priority

Due today

Waiting for client

Waiting for another team member

Highlight:

- overdue work
- blocked tickets
- dependencies

---

# Section 4 — Project Health

Identify:

High-risk projects

Upcoming deadlines

Delivery risks

Cross-team dependencies

Client risks

Potential bottlenecks

Explain why each risk matters.

---

# Section 5 — Communication

Summarise:

Important emails

Teams mentions

Replies waiting for me

Client communication

Manager requests

Review requests

Only include communication requiring action.

---

# Section 6 — Recommended Priorities

Apply the Eisenhower Matrix from `runtime/48_Reasoning_Engine.md` during Runtime 41 Step 6 before selecting Top 3.

## Output Rules

All modes use the unified **Morning Card** layout (`templates/i18n/_morning-layout.md`) — same structure on Claude App desktop and mobile. User must grasp First action within **10 seconds** and full picture within **1 minute**.

**Scan order:** Snapshot → At a glance (Team, Calendar, Jira) → Priorities (Top 3 + Next 2) → Risks → Stand-up.

### Brief and Standard Mode

Present the **Morning Card** — not a free-form summary. **Top 3** as primary focus, plus **Next 2** and Jira link in At a glance.

For each Top 3 and Next 2 item:

- prefix with Eisenhower tag: `[Q1]`, `[Q2]`, `[Q3]`, or `[Q4]` when useful (Q4 in Top 3 is rare)
- include a short **why** grounded in evidence (due date, blocker, commitment, bucket, calendar — not keyword guessing)
- for Jira issues in Next 2, include **key** and link to the issue `url`
- do **not** show the full matrix by default

**Open on Jira:** after `jira_get_morning_context`, show `assigned_open` count and a filter link:

- URL: `{JIRA_BASE_URL}/issues/?jql=` + encoded JQL
- JQL: `assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC`
- aligns with gateway `assigned_open` filtering (statusCategory, not `resolution`)

Valid Top 3 distributions include **zero Q1**, **one Q1**, or **multiple Q1** — follow evidence, not a fixed recipe.

### Full Mode

May additionally include:

- **Mini Eisenhower Matrix** — four quadrants with bullet lists of classified candidates
- per-item or overall **confidence** when evidence is thin
- **missing context** that would change classification
- **Q4** review suggestions (defer, merge duplicate, flag obsolete) — always as recommendations for human confirmation, never as automatic delete or close

## Distinction: Jira Priority vs Eisenhower

Jira's `priority` field (Normal, High, etc.) is **not** the same as Eisenhower Importance or quadrant. Use it only as a secondary signal alongside due dates, blockers, dependencies, and communication evidence.

## Inputs (via Runtime 41)

Recommendations should consider:

- urgency (overdue, due today, same-day commitments, incidents)
- business impact and delivery risk
- dependencies and blockers
- client commitments
- available team members and focus time

## Examples (Brief / Standard Top 3 + Next 2)

**Top 3**

1. `[Q1]` TRIN-82 — Review before 15:00 release window; blocking deploy (due today, client path).
2. `[Q1]` Reply to Travis — EOD response committed in email thread (same-day commitment).
3. `[Q2]` UP-179 — Ownership UI; important but no due today; schedule deep work 10:00–12:00.

**Next 2**

4. `[Q2]` [UP-247](https://wootech.atlassian.net/browse/UP-247) — Home page styling after backend integration.
5. `[Q3]` [CW-121](https://wootech.atlassian.net/browse/CW-121) — PM clarification pending; batch follow-up.

**Open on Jira**

- 38 open issues assigned to you — [View all open tasks](https://wootech.atlassian.net/issues/?jql=assignee%20%3D%20currentUser()%20AND%20statusCategory%20!%3D%20Done%20ORDER%20BY%20updated%20DESC)

## Example (Full Mode — Mini Matrix)

| | Important | Not Important |
|---|---|---|
| **Urgent** | **Q1:** TRIN-82 release review | **Q3:** PM ping on CW-121 — coordinate, don't implement today |
| **Not Urgent** | **Q2:** UP-179 deep work block | **Q4:** Docs tidy — defer unless focus says otherwise |

Confidence: Medium — Jira available; calendar partial.

---

# Section 7 — Suggested Schedule

Suggest a realistic working plan.

Example:

09:00

Morning Brief

↓

09:15

Stand-up

↓

09:30

TT-128

↓

11:00

Review CGA EDM

↓

13:00

Meeting

↓

15:00

Deployment

The schedule should remain flexible.

---

# Section 8 — Stand-up Draft

Automatically prepare:

Yesterday

Today

Blockers

The draft should be concise, professional, and ready to speak.

---

# Section 9 — AI Recommendations

This is the most valuable section.

Do not simply repeat information.

Instead, provide insight.

Examples:

- Review TT-130 before TT-128 because Quyen is on leave.

- Complete the EDM before the afternoon meeting.

- Respond to Michael first because his review is blocking delivery.

- Delay lower-priority content work until client feedback arrives.

Recommendations should improve decision quality.

---

# Quality Checklist

Before presenting the Morning Brief, verify:

✓ All sections are included.

✓ Live data is preferred over memory.

✓ Risks are highlighted.

✓ Blockers are identified.

✓ Recommendations are actionable.

✓ Top 3 and Next 2 items have Eisenhower tags and evidence-backed why where applicable.

✓ Open on Jira link and count shown when Jira context was loaded.

✓ No fake urgency invented to fill Q1.

✓ Jira `priority` is not used as a direct Eisenhower substitute.

✓ Q3/Q4 suggestions do not auto-assign, auto-close, or auto-delete.

✓ No unsupported assumptions are presented as facts.

---

# Success Criteria

A successful Morning Brief enables me to:

- understand today's situation within five minutes
- know exactly what to do first
- identify delivery risks early
- communicate proactively
- prepare for meetings
- improve planning throughout the day

# Report Modes

The Morning Brief supports two presentation modes depending on the situation.

### Executive Summary

Purpose:

Provide a quick overview in less than two minutes.

Include only:

- Team Availability
- Calendar Highlights
- Top 3 Priorities (each with `[Q1]`–`[Q4]` tag and short why)
- Next 2 (also on radar)
- Open on Jira (count + filter link, when Jira loaded)
- Critical Risks
- First Recommended Action (aligned with best Q1 or Q2)

This mode is intended for quickly starting the workday.

---

### Full Briefing

Purpose:

Provide complete situational awareness before beginning work.

Include every section defined in this specification.

Use this mode when:

- starting the workday
- planning complex work
- preparing for stand-up
- reviewing project health
