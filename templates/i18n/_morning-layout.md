# Morning Card — Unified Layout

Shared presentation rules for `/morning`, `/chaobuoisang`, and natural-language triggers ("good morning", "chào buổi sáng", "prepare my morning brief") on **Claude App desktop and mobile**, **Claude Code**, and any client loading these templates.

Goals: **complete**, **accurate** (per workflow data), **scannable in under 1 minute**.

---

## Principles

1. **Same section order** in every language — only labels and prose change.
2. **Mobile-first** — no wide tables in brief/standard; use single-line label → value pairs.
3. **Snapshot first** — the first 3 lines answer "what do I do now?"
4. **Links on keys** — every Jira issue key is a markdown link when `url` exists.
5. **Honest gaps** — use `—` or "Not verified" instead of omitting a section.
6. **No prose walls** — one line per priority item; max 2 lines per risk.

---

## Section Order (mandatory)

1. Title + date + timezone + mode
2. Snapshot (First action, Mission, Confidence + source ticks)
3. Context at a glance (Team, Calendar, Jira summary + link)
4. Priorities (Top 3, then Next 2)
5. Risks
6. Stand-up draft
7. Footer (optional one line: save offer — do not block the card)

---

## Source Ticks

In Snapshot confidence line, show which live sources were loaded:

`Jira ✓` · `Team ✓` · `Calendar ✓` · `Email ✓` · `Teams ○` · `Confluence ○`

- `✓` = loaded with data
- `○` = not loaded or unavailable
- `!` = loaded but error (use sparingly)

---

## Eisenhower Tags (inline)

Always prefix priority lines:

| Tag | EN label | VI label |
|-----|----------|----------|
| Q1 | Do now | Làm ngay |
| Q2 | Schedule | Lên lịch |
| Q3 | Coordinate | Phối hợp |
| Q4 | Review | Xem xét |

Format: `**[Q1]** [KEY](url) — one-line why`

---

## Jira Open Link

Always in Context at a glance:

- Count = `assigned_open.length` from `jira_get_morning_context`
- Link = `{baseUrl}/issues/?jql=` + URL-encoded  
  `assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC`
- Also show due today / overdue counts from buckets when available

---

## Mode Differences

| Section | brief | standard | full |
|---------|-------|----------|------|
| Snapshot | ✓ | ✓ | ✓ expanded |
| Context at a glance | ✓ compact | ✓ | ✓ + Context Budget detail |
| Team detail | 1–2 lines in glance | 1–2 lines | Verified/Inferred/Unknown |
| Calendar | next 2 events max | today's list (3 max) | full highlights |
| Priorities Top 3 + Next 2 | ✓ | ✓ | ✓ + optional matrix |
| Risks | max 3 bullets | max 3 bullets | unlimited |
| Stand-up | ✓ | ✓ | ✓ |

**Claude App default:** use **standard** unless the user asks for `brief` or `full`.

**Speed:** brief/standard uses one `morning_brief` call with bundled `live` data (~70% smaller payload, no separate Jira/team round-trips).

---

## Triggers (same output profile)

| Trigger | Language | Template |
|---------|----------|----------|
| `/morning` | en | `morning.en.md` |
| `/chaobuoisang` | vi | `morning.vi.md` |
| "good morning", "morning brief" | en | `morning.en.md` |
| "chào buổi sáng", "báo cáo đầu ngày" | vi | `morning.vi.md` |

Natural-language triggers follow the **same Morning Card layout** as slash commands.

---

## Do Not

- Skip Team or Jira link when tools were available to call
- Use timeline layouts (morning/midday/afternoon) or Needs attention/Resolved sections — use Morning Card only
- Use HTML (Claude App markdown only)
- Use nested tables
- Duplicate the same issue in Top 3 and Next 2
- Add filler text before the Snapshot block
