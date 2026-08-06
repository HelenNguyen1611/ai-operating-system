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
| **layout** | `templates/i18n/_morning-layout.md` |
| **language** | `vi` |
| **detail** | `standard` |

---

## Instructions

1. Read and follow `commands/_base/morning.base.md` for all workflow logic.
2. Apply `templates/i18n/_morning-layout.md` for unified Morning Card structure (desktop + mobile).
3. Apply `templates/i18n/morning.vi.md` for Vietnamese labels and section text.
4. Apply `templates/i18n/_language-rules.md` for language behaviour.

Natural-language triggers ("chào buổi sáng", "báo cáo đầu ngày") use the **same Morning Card** as this command.

**Claude App:** default detail is **standard** unless the user asks for `brief` or `full`.

---

## Argument Parsing

Parse `$ARGUMENTS` before executing.

**Detail tokens:** `brief` · `standard` · `full`

If omitted, use default detail: **standard**.

**Language override** (optional): `en` · `bilingual` — switch template to `templates/i18n/morning.en.md` when `en`; apply bilingual rules when `bilingual`.

Everything else is **focus context** (e.g. `focus on Travis email`, `tập trung TRIN-79`, `không có meeting`).

**Examples:**

| Input | Detail | Focus |
|-------|--------|-------|
| *(empty)* | standard | — |
| `brief` | brief | — |
| `full` | full | — |
| `focus on Travis email` | standard | focus on Travis email |
| `en standard` | standard | — (English template) |

---

## Output

Produce Vietnamese báo cáo đầu ngày using the **Morning Card** layout unless language override is explicit.

Optimise for a **1-minute scan**: Tóm tắt nhanh first, then Tổng quan, then Ưu tiên.

Stand-up section remains English by default (see `_language-rules.md`).
