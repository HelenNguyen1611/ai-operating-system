import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVICE_NAME, SERVICE_VERSION, registerHealthCheck } from "./health-check.js";
import { registerMorningBrief } from "./morning-brief.js";
import { registerJiraSearchIssues } from "./jira-search-issues.js";
import { registerJiraGetIssue } from "./jira-get-issue.js";
import { registerJiraMorningContext } from "./jira-morning-context.js";
import { registerTeamAvailabilityGetAvailability } from "./team-availability-get-availability.js";

export { SERVICE_NAME, SERVICE_VERSION, HEALTH_PAYLOAD } from "./health-check.js";

/**
 * Single place that assembles every tool the gateway exposes. server.ts
 * calls this and otherwise knows nothing about individual tools — the
 * split mandated by ROADMAP.md's Phase 1 tool-extraction obligation.
 *
 * health_check and morning_brief registration is unchanged from Phase 1 —
 * the three jira_* registrations are additive (Phase 2). team_availability_*
 * is additive on top of that — standalone adapter/tool, not wired into
 * morning_brief.ts (deliberate, per the investigation baseline — Morning
 * Brief integration is a separate later phase).
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
  registerTeamAvailabilityGetAvailability(server);

  return server;
}
