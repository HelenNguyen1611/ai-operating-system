import express, { type Express, type Request, type Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export const SERVICE_NAME = "ai-operating-system-mcp-gateway";
export const SERVICE_VERSION = "0.1.0";

const HEALTH_PAYLOAD = {
  status: "ok",
  service: SERVICE_NAME,
  version: SERVICE_VERSION,
} as const;

function buildMcpServer(): McpServer {
  const server = new McpServer({
    name: SERVICE_NAME,
    version: SERVICE_VERSION,
  });

  server.registerTool(
    "health_check",
    {
      title: "Health Check",
      description:
        "Returns the gateway service status. Phase 0 compatibility spike — the only tool exposed.",
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

  return server;
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json(HEALTH_PAYLOAD);
  });

  // Stateless mode: a fresh server + transport per request, no session state.
  // Sufficient for Phase 0; session management is a later-phase concern.
  app.post("/mcp", async (req: Request, res: Response) => {
    const server = buildMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      void transport.close();
      void server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  // Stateless server: no SSE notification stream, no sessions to terminate.
  const methodNotAllowed = (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed" },
      id: null,
    });
  };
  app.get("/mcp", methodNotAllowed);
  app.delete("/mcp", methodNotAllowed);

  return app;
}
