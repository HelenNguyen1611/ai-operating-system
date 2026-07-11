import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createApp, SERVICE_NAME, SERVICE_VERSION } from "../src/server.js";

let httpServer: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = createApp();
  httpServer = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const { port } = httpServer.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    httpServer.close((err) => (err ? reject(err) : resolve()));
  });
});

async function connectMcpClient(): Promise<Client> {
  const client = new Client({ name: "gateway-test-client", version: "0.0.1" });
  const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
  await client.connect(transport);
  return client;
}

describe("server startup", () => {
  it("listens and accepts TCP connections", () => {
    expect(httpServer.listening).toBe(true);
    expect(baseUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
  });
});

describe("GET /health", () => {
  it("returns 200 with the service payload", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: "ok",
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
    });
  });
});

describe("MCP tool discovery", () => {
  it("lists exactly the health_check tool", async () => {
    const client = await connectMcpClient();
    try {
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name)).toEqual(["health_check"]);
    } finally {
      await client.close();
    }
  });
});

describe("health_check invocation", () => {
  it("returns the required status payload", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({ name: "health_check", arguments: {} });
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe("text");
      expect(JSON.parse(content[0].text)).toEqual({
        status: "ok",
        service: "ai-operating-system-mcp-gateway",
        version: "0.1.0",
      });
    } finally {
      await client.close();
    }
  });
});
