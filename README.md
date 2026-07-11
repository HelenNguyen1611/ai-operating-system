# AI Operating System Framework

A structured knowledge and execution system for an AI Chief of Staff — handbooks, runtime, commands, and templates.

---

## Commands

### `/morning`

English Morning Brief.

| Default | Value |
|---------|-------|
| Language | English |
| Detail | standard |
| Template | `templates/i18n/morning.en.md` |

```
/morning
/morning brief
/morning brief focus on TRIN-79
/morning full
```

### `/chaobuoisang`

Vietnamese Morning Brief.

| Default | Value |
|---------|-------|
| Language | Vietnamese |
| Detail | brief |
| Template | `templates/i18n/morning.vi.md` |

```
/chaobuoisang
/chaobuoisang standard
/chaobuoisang full
/chaobuoisang focus on Travis email
```

Both commands share the same base workflow (`commands/_base/morning.base.md`). Only language, template, and default detail differ. Runtime and handbook files remain language-neutral.

**i18n files:**

- `commands/_base/morning.base.md` — shared workflow
- `templates/i18n/_language-rules.md` — language rules
- `templates/i18n/morning.en.md` — English output
- `templates/i18n/morning.vi.md` — Vietnamese output

**Claude Code:** `.claude/commands/` symlinks to `commands/` (source of truth).

---

## Runtime Configuration

`config/runtime.yaml` defines timezone, locale, output preferences, and safe retrieval windows.

- Morning commands use **Asia/Ho_Chi_Minh** for Helen pilot.
- External connector timestamps may be UTC and must be **normalised** to local timezone before reasoning.
- Email search uses **last_36_hours** to avoid timezone boundary misses.
- Do not classify today/yesterday using UTC alone.

See `tests/manual/timezone-email-retrieval.md` for manual verification prompts.

---

## Applications

### `apps/mcp-gateway`

Remote MCP Gateway — makes this Operating System reachable from external AI clients (starting with the Claude App) over the Model Context Protocol, instead of relying on client-specific connectors.

Status: **Experimental (Phase 0 — compatibility spike)**. Exposes one tool, `health_check`, over Streamable HTTP. See `runtime/50_Remote_Gateway.md` for scope, non-goals, and future direction, and `apps/mcp-gateway/docs/manual-test-claude-app.md` to connect a client.

Self-contained package; the repository root remains package-less.

---

## Navigation

- `AI_SYSTEM_MAP.md` — system architecture
- `SYSTEM_INDEX.md` — intent → runtime → handbook routing
- `handbook/` — knowledge layer (00–39)
- `runtime/` — execution layer (40–49)
- `apps/` — applications built on the framework (e.g. `apps/mcp-gateway`)
