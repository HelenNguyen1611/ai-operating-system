---
description: Báo cáo đầu ngày — nhận thức tình huống, ưu tiên, rủi ro, stand-up và kế hoạch thực thi hôm nay (mặc định tiếng Việt).
argument-hint: [detail] [optional focus, e.g. "full" or "focus on Travis email"]
---

# /chaobuoisang — Báo cáo đầu ngày

Vietnamese output by default.

---

## Configuration

| Setting | Value |
|---------|-------|
| **base** | `commands/_base/morning.base.md` |
| **template** | `templates/i18n/morning.vi.md` |
| **language** | `vi` |
| **detail** | `brief` |

---

## Instructions

1. Read and follow `commands/_base/morning.base.md` for all workflow logic.
2. Apply `templates/i18n/morning.vi.md` for output structure.
3. Apply `templates/i18n/_language-rules.md` for language behaviour.

---

## Argument Parsing

Parse `$ARGUMENTS` before executing.

**Detail tokens:** `brief` · `standard` · `full`

If omitted, use default detail: **brief**.

**Language override** (optional): `en` · `bilingual` — switch template to `templates/i18n/morning.en.md` when `en`; apply bilingual rules when `bilingual`.

Everything else is **focus context** (e.g. `focus on Travis email`, `tập trung TRIN-79`, `không có meeting`).

**Examples:**

| Input | Detail | Focus |
|-------|--------|-------|
| *(empty)* | brief | — |
| `standard` | standard | — |
| `full` | full | — |
| `focus on Travis email` | brief | focus on Travis email |
| `en standard` | standard | — (English template) |

---

## Output

Produce Vietnamese báo cáo đầu ngày unless language override is explicit.

Stand-up section remains English by default (see `_language-rules.md`).

Keep output short and easy to scan.
