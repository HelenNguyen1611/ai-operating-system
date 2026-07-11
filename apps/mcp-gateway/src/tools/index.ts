import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVICE_NAME, SERVICE_VERSION, registerHealthCheck } from "./health-check.js";
import { registerMorningBrief } from "./morning-brief.js";
import { registerJiraSearchIssues } from "./jira-search-issues.js";
import { registerJiraGetIssue } from "./jira-get-issue.js";
import { registerJiraMorningContext } from "./jira-morning-context.js";

export { SERVICE_NAME, SERVICE_VERSION, HEALTH_PAYLOAD } from "./health-check.js";

/**
 * Single place that assembles every tool the gateway exposes. server.ts
 * calls this and otherwise knows nothing about individual tools — the
 * split mandated by ROADMAP.md's Phase 1 tool-extraction obligation.
 *
 * health_check and morning_brief registration is unchanged from Phase 1 —
 * the three jira.* registrations below are purely additive (Phase 2).
 */
export function buildMcpServer(): McpServer {
  const server = new McpServer({
    name: SERVICE_NAME,
    version: SERVICE_VERSION,
  });

  registerHealthCheck(server);
  registerMorningBrief(server);
  registerJiraSearchIssues(server);
  registerJiraGetIssue(server);
  registerJiraMorningContext(server);

  return server;
}
