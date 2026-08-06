---
description: English Morning Brief — situational awareness, priorities, risks, stand-up draft, and execution plan for today.
argument-hint: [detail] [optional focus, e.g. "brief focus on TRIN-79" or "full"]
---

# /morning — Morning Brief

English output by default.

---

## Configuration

| Setting | Value |
|---------|-------|
| **base** | `commands/_base/morning.base.md` |
| **template** | `templates/i18n/morning.en.md` |
| **layout** | `templates/i18n/_morning-layout.md` |
| **language** | `en` |
| **detail** | `standard` |

---

## Instructions

1. Read and follow `commands/_base/morning.base.md` for all workflow logic.
2. Apply `templates/i18n/_morning-layout.md` for unified Morning Card structure (desktop + mobile).
3. Apply `templates/i18n/morning.en.md` for English labels and section text.
4. Apply `templates/i18n/_language-rules.md` for language behaviour.

Natural-language triggers ("good morning", "morning brief") use the **same Morning Card** as this command.

**Claude App:** call **`morning_brief({ language: "en", detail: "standard" })` once** — paste result verbatim. Do **not** search Outlook/Teams/Jira separately unless user asked for email/calendar focus or `full`.

---

## Argument Parsing

Parse `$ARGUMENTS` before executing.

**Detail tokens:** `brief` · `standard` · `full`

If omitted, use default detail: **standard**.

**Language override** (optional): `vi` · `bilingual` — switch template to `templates/i18n/morning.vi.md` when `vi`; apply bilingual rules when `bilingual`.

Everything else is **focus context** (e.g. `focus on TRIN-79`, `no meetings today`).

**Examples:**

| Input | Detail | Focus |
|-------|--------|-------|
| *(empty)* | standard | — |
| `brief` | brief | — |
| `full` | full | — |
| `brief focus on TRIN-79` | brief | focus on TRIN-79 |
| `vi brief` | brief | — (Vietnamese template) |

---

## Output

Produce English Morning Brief using the **Morning Card** layout unless language override is explicit.

Optimise for a **1-minute scan**: Snapshot first, then At a glance, then Priorities.
