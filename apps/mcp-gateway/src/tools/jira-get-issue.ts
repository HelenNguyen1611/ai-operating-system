import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetIssueInputSchema, GetIssueInputShape } from "../schemas/jira/get-issue.input.js";
import { loadJiraConfig } from "../adapters/jira/config.js";
import { createJiraAdapter } from "../adapters/jira/index.js";
import { buildErrorResult } from "../types/error-envelope.js";
import { mapJiraAdapterError } from "./jira-error-mapping.js";
import { JiraNotConfiguredError } from "../adapters/jira/errors.js";

export function registerJiraGetIssue(server: McpServer): void {
  server.registerTool(
    "jira_get_issue",
    {
      title: "Jira Get Issue",
      description:
        "Fetches a single Jira issue by key (e.g. TRIN-79) and returns a mapped summary. " +
        "Read-only — no write, transition, or comment capability exists in this tool.",
      inputSchema: GetIssueInputShape,
    },
    async (args) => {
      const parsed = GetIssueInputSchema.safeParse(args);
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
        const issue = await adapter.getIssue(parsed.data.key);
        return { content: [{ type: "text", text: JSON.stringify(issue) }] };
      } catch (error) {
        return mapJiraAdapterError(error);
      }
    },
  );
}
