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
| **language** | `en` |
| **detail** | `standard` |

---

## Instructions

1. Read and follow `commands/_base/morning.base.md` for all workflow logic.
2. Apply `templates/i18n/morning.en.md` for output structure.
3. Apply `templates/i18n/_language-rules.md` for language behaviour.

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

Produce English Morning Brief unless language override is explicit.

Keep output short and easy to scan.
