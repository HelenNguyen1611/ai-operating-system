# Claude Desktop — Local Scheduled Routines

Prompt files for **Routines → New routine → Local** in Claude Desktop.

Schedule (weekdays, Asia/Ho_Chi_Minh):

| File | Time | Routine name |
|------|------|--------------|
| `morning-prep-0830.md` | 8:30 | `morning-prep-0830` |
| `morning-brief-0900.md` | 9:00 | `morning-brief-0900` |
| `midday-check-1300.md` | 13:00 | `midday-check-1300` |
| `afternoon-check-1500.md` | 15:00 | `afternoon-check-1500` |

## Prerequisites (before tasks can run)

1. MCP stack running: `cd apps/mcp-gateway && npm run stack:start`
2. Claude Desktop open; **Keep computer awake** enabled (Settings → Desktop app → General)
3. MCP connector URL matches current tunnel — see `apps/mcp-gateway/.run/tunnel.url`
4. Power Automate leave snapshot fresh (`team-availability.json`)

## Setup each routine

1. Claude Desktop → **Routines** → **New routine** → **Local**
2. **Name:** match the routine name in the table above
3. **Description:** copy from the file's YAML `description` field
4. **Instructions:** copy everything **below** the `---` frontmatter (the prompt body)
5. **Folder:** this repository (`Personal-AI-Operating-System`)
6. **Schedule:** Weekdays at the time in the table  
   - For **8:30**, use chat: *"Set this routine to run weekdays at 8:30 AM local time"* (picker may only offer whole hours)
7. **Permission mode:** Auto (avoid Manual — MCP calls stall unattended)
8. **Run now** once → approve MCP tools → choose **always allow**

## Alternative: edit on disk

Claude Desktop also stores tasks under `~/.claude/scheduled-tasks/<name>/SKILL.md`. You can paste the full file (frontmatter + body) there after creating the routine once in the UI.

## Related

- `commands/_base/morning.base.md` — fast path rules
- `commands/chaobuoisang.md` — Vietnamese morning command
- `apps/mcp-gateway/scripts/` — gateway + cloudflared auto-start
