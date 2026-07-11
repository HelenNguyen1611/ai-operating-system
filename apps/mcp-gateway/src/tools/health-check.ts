import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const SERVICE_NAME = "ai-operating-system-mcp-gateway";
export const SERVICE_VERSION = "0.1.0";

export const HEALTH_PAYLOAD = {
  status: "ok",
  service: SERVICE_NAME,
  version: SERVICE_VERSION,
} as const;

/**
 * Moved out of server.ts unchanged (Phase 1 tool-extraction obligation
 * from ROADMAP.md — "the first non-platform tool forces the extraction").
 * Name, description, and output are byte-for-byte identical to Phase 0.
 */
export function registerHealthCheck(server: McpServer): void {
  server.registerTool(
    "health_check",
    {
      title: "Health Check",
      description:
        "Returns the gateway service status. Platform tool — kept unnamespaced per the health_check naming precedent (ARCHITECTURE.md §1).",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(HEALTH_PAYLOAD),
        },
      ],
    }),
  );
}
