# Morning Fast Path (brief / standard)

Condensed rules for Claude App `morning_brief` when `detail` is `brief` or `standard`. Full runtimes (41/46/48) apply only for `detail: full`.

## Speed rules (mandatory)

1. **Live data is pre-rendered** — for brief/standard, `morning_brief` returns **markdown Morning Card**. Show it **verbatim** to the user.
2. **Do NOT reformat** — no timeline (morning/midday/afternoon), no Needs attention/Resolved sections.
3. **Skip email/calendar deep search** in brief/standard unless the user explicitly asked for email or calendar focus.
4. **Call `daily_report_save` after** showing the brief (pass `summary` only) — never block the reply on save.

## Collect context (from payload.live)

- **Jira:** use `live.jira` buckets (`assigned_open`, `due_today`, `overdue`, `recently_updated`). If `live.jira_error`, show `Jira ○` in Snapshot.
- **Team:** use `live.team_summary.line_en` (EN) or `live.team_summary.line_vi` (VI) **verbatim** in At a glance. Never omit the Team line — even when everyone is available or snapshot shows zero events today.
- **Calendar / Email:** only if already in conversation or user focus — do not search M365 by default in brief/standard.

Timezone: use `config/runtime.yaml` (`Asia/Ho_Chi_Minh`). Never classify today/yesterday in UTC.

## Eisenhower (Runtime 48 excerpt)

| Q | Action |
|---|--------|
| Q1 | Do now — high urgency + high importance |
| Q2 | Schedule — low urgency + high importance |
| Q3 | Coordinate — high urgency + low importance; never auto-assign |
| Q4 | Review/defer — low/low; never auto-delete |

Jira `priority` is secondary only. Each Top 3 / Next 2 item needs `[Qn]` tag + evidence-backed **why**.

**Top 3:** flexible mix (0–n Q1). Draw from Q1, then Q2; Q3 only for same-day coordination; Q4 rare.

**Next 2:** ranks 4–5 from same ordering; Jira keys as links.

**First action:** best immediate Q1, or best Q2 if no true Q1.

**Jira link:** count = `assigned_open.length`; URL = `{baseUrl}/issues/?jql=` + encoded  
`assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC`

Dedupe same issue across buckets. State clearly when no true Q1 exists.

## Output

Follow `context.layout` + `context.template` — Morning Card scan order:

Snapshot → At a glance → Priorities (Top 3 + Next 2) → Risks (max 3) → Stand-up.

User must grasp First action in **10 seconds**, full card in **1 minute**.

## Gates (light check)

- **Gate 2:** Top 3 each have tag + why; First action aligned; no keyword-only guessing.
- **Gate 3:** Team line present; blockers in Risks if known.

Skip expanded Context Budget, Decision Gate prose, and learning sections in brief/standard.
