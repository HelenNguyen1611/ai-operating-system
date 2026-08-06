import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  GetMorningContextInputSchema,
  GetMorningContextInputShape,
} from "../schemas/jira/get-morning-context.input.js";
import { loadJiraConfig } from "../adapters/jira/config.js";
import { createJiraAdapter } from "../adapters/jira/index.js";
import { buildErrorResult } from "../types/error-envelope.js";
import { mapJiraAdapterError } from "./jira-error-mapping.js";
import { JiraNotConfiguredError } from "../adapters/jira/errors.js";

export function registerJiraMorningContext(server: McpServer): void {
  server.registerTool(
    "jira_get_morning_context",
    {
      title: "Jira Morning Context",
      description:
        "Low-level Jira bucket API. **Do not call for standard morning brief** — use morning_brief instead " +
        "(it already includes this data). Use only for ad-hoc Jira queries outside the morning workflow. " +
        "Returns assigned_open, recently_updated, due_today, overdue. Read-only.",
      inputSchema: GetMorningContextInputShape,
    },
    async (args) => {
      const parsed = GetMorningContextInputSchema.safeParse(args);
      if (!parsed.success) {
        return buildErrorResult("VALIDATION_FAILED", "jira", `Invalid input: ${parsed.error.message}`);
      }

      const config = loadJiraConfig();
      if (!config) {
        return buildErrorResult(
          "ADAPTER_NOT_CONFIGURED",
          "jira",
          new JiraNotConfiguredError().message,
        );
      }

      try {
        const adapter = createJiraAdapter(config);
        const context = await adapter.getMorningContext();
        return { content: [{ type: "text", text: JSON.stringify(context) }] };
      } catch (error) {
        return mapJiraAdapterError(error);
      }
    },
  );
}
