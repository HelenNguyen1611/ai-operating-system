import express, { type Express, type Request, type Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { buildMcpServer, HEALTH_PAYLOAD, SERVICE_NAME, SERVICE_VERSION } from "./tools/index.js";

export { SERVICE_NAME, SERVICE_VERSION };

/**
 * Pure transport wiring only — no tool logic lives here. Tools are
 * assembled in ./tools/index.ts (Phase 1 extraction, per ROADMAP.md).
 */
export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json(HEALTH_PAYLOAD);
  });

  // Stateless mode: a fresh server + transport per request, no session state.
  // Sufficient through Phase 1; session management is a later-phase concern.
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
