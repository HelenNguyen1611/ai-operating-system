
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SearchIssuesInputSchema, SearchIssuesInputShape } from "../schemas/jira/search-issues.input.js";
import { loadJiraConfig } from "../adapters/jira/config.js";
import { createJiraAdapter } from "../adapters/jira/index.js";
import { buildErrorResult } from "../types/error-envelope.js";
import { mapJiraAdapterError } from "./jira-error-mapping.js";
import { JiraNotConfiguredError } from "../adapters/jira/errors.js";

export function registerJiraSearchIssues(server: McpServer): void {
  server.registerTool(
    "jira_search_issues",
    {
      title: "Jira Search Issues",
      description:
        "Runs a JQL search against Jira Cloud and returns mapped issue summaries. Read-only — " +
        "no write, transition, or comment capability exists in this tool.",
      inputSchema: SearchIssuesInputShape,
    },
    async (args) => {
      const parsed = SearchIssuesInputSchema.safeParse(args);
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
        const result = await adapter.searchIssues(parsed.data.jql, parsed.data.maxResults);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (error) {
        return mapJiraAdapterError(error);
      }
    },
  );
}
