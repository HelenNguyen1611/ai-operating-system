import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createApp } from "../src/server.js";

const TEAM_AVAILABILITY_ENV_KEYS = ["TEAM_AVAILABILITY_SNAPSHOT_PATH", "TEAM_AVAILABILITY_MAX_AGE_MINUTES"] as const;

let httpServer: Server;
let baseUrl: string;
let savedEnv: Record<string, string | undefined>;

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

// Same rationale as tests/jira-tools.test.ts — exercises the "not
// configured" path only, so the gateway never touches the real filesystem
// for a snapshot path from this suite. Direct adapter-level behavior is
// covered in tests/adapters/team-availability.test.ts with temp files.
beforeEach(() => {
  savedEnv = {};
  for (const key of TEAM_AVAILABILITY_ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of TEAM_AVAILABILITY_ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
});

async function connectMcpClient(): Promise<Client> {
  const client = new Client({ name: "team-availability-tools-test-client", version: "0.0.1" });
  const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
  await client.connect(transport);
  return client;
}

describe("tools/list includes team_availability_get_availability", () => {
  it("registers team_availability_get_availability", async () => {
    const client = await connectMcpClient();
    try {
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name)).toContain("team_availability_get_availability");
    } finally {
      await client.close();
    }
  });

  it("stays listed even without Team Availability configured (discoverability is independent of configuration)", async () => {
    const client = await connectMcpClient();
    try {
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name)).toContain("team_availability_get_availability");
    } finally {
      await client.close();
    }
  });
});

describe("team_availability_get_availability without configuration", () => {
  it("returns ADAPTER_NOT_CONFIGURED, not a crash or a real network call", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({
        name: "team_availability_get_availability",
        arguments: {},
      });
      expect(result.isError).toBeTruthy();
      const content = result.content as Array<{ type: string; text: string }>;
      const envelope = JSON.parse(content[0].text);
      expect(envelope.error.code).toBe("ADAPTER_NOT_CONFIGURED");
      expect(envelope.error.domain).toBe("team_availability");
    } finally {
      await client.close();
    }
  });

  it("rejects an invalid date before any config/network concern", async () => {
    const client = await connectMcpClient();
    try {
      // The MCP SDK validates against inputSchema itself before the handler
      // runs, so an invalid date never reaches our VALIDATION_FAILED
      // envelope — same as tests/jira-tools.test.ts's "invalid key" case,
      // this only asserts the call is rejected, not the exact error shape.
      const result = await client.callTool({
        name: "team_availability_get_availability",
        arguments: { date: "not-a-date" },
      });
      expect(result.isError).toBeTruthy();
    } finally {
      await client.close();
    }
  });

  it("rejects an unsupported team_scope value (only 'all' is accepted for MVP)", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({
        name: "team_availability_get_availability",
        arguments: { team_scope: "engineering" },
      });
      expect(result.isError).toBeTruthy();
    } finally {
      await client.close();
    }
  });
});
