import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVICE_NAME, SERVICE_VERSION, registerHealthCheck } from "./health-check.js";
import { registerMorningBrief } from "./morning-brief.js";

export { SERVICE_NAME, SERVICE_VERSION, HEALTH_PAYLOAD } from "./health-check.js";

/**
 * Single place that assembles every tool the gateway exposes. server.ts
 * calls this and otherwise knows nothing about individual tools — the
 * split mandated by ROADMAP.md's Phase 1 tool-extraction obligation.
 */
export function buildMcpServer(): McpServer {
  const server = new McpServer({
    name: SERVICE_NAME,
    version: SERVICE_VERSION,
  });

  registerHealthCheck(server);
  registerMorningBrief(server);

  return server;
}
