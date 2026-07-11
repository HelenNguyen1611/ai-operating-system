import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createApp } from "../src/server.js";

const JIRA_ENV_KEYS = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN"] as const;

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

// These tests exercise the "not configured" path deliberately, so JIRA_*
// env vars are removed before each test and restored after — the gateway
// must never make a real network call to Jira from this suite, per Phase 2
// Task 5 ("Do not call Jira automatically during tests"). Direct
// adapter-level behavior (successful calls, pagination, errors, timeouts)
// is covered separately in tests/adapters/jira.test.ts with an injected
// mock fetch — this file only exercises what the MCP tool layer does with
// an *absent* configuration, which never reaches the network at all.
beforeEach(() => {
  savedEnv = {};
  for (const key of JIRA_ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of JIRA_ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
});

async function connectMcpClient(): Promise<Client> {
  const client = new Client({ name: "jira-tools-test-client", version: "0.0.1" });
  const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
  await client.connect(transport);
  return client;
}

describe("tools/list includes the new Jira tools", () => {
  it("registers jira.search_issues, jira.get_issue, and jira.get_morning_context", async () => {
    const client = await connectMcpClient();
    try {
      const { tools } = await client.listTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain("jira.search_issues");
      expect(names).toContain("jira.get_issue");
      expect(names).toContain("jira.get_morning_context");
    } finally {
      await client.close();
    }
  });

  it("tools remain listed even without Jira configured (discoverability is independent of configuration)", async () => {
    const client = await connectMcpClient();
    try {
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name)).toContain("jira.search_issues");
    } finally {
      await client.close();
    }
  });
});

describe("jira.* tools without configuration", () => {
  it("jira.search_issues returns ADAPTER_NOT_CONFIGURED, not a crash or a real network call", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({
        name: "jira.search_issues",
        arguments: { jql: "assignee = currentUser()" },
      });
      expect(result.isError).toBeTruthy();
      const content = result.content as Array<{ type: string; text: string }>;
      const envelope = JSON.parse(content[0].text);
      expect(envelope.error.code).toBe("ADAPTER_NOT_CONFIGURED");
      expect(envelope.error.domain).toBe("jira");
    } finally {
      await client.close();
    }
  });

  it("jira.get_issue returns ADAPTER_NOT_CONFIGURED", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({
        name: "jira.get_issue",
        arguments: { key: "TRIN-79" },
      });
      expect(result.isError).toBeTruthy();
      const content = result.content as Array<{ type: string; text: string }>;
      const envelope = JSON.parse(content[0].text);
      expect(envelope.error.code).toBe("ADAPTER_NOT_CONFIGURED");
    } finally {
      await client.close();
    }
  });

  it("jira.get_morning_context returns ADAPTER_NOT_CONFIGURED", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({
        name: "jira.get_morning_context",
        arguments: {},
      });
      expect(result.isError).toBeTruthy();
      const content = result.content as Array<{ type: string; text: string }>;
      const envelope = JSON.parse(content[0].text);
      expect(envelope.error.code).toBe("ADAPTER_NOT_CONFIGURED");
    } finally {
      await client.close();
    }
  });

  it("rejects an invalid jira.get_issue key before any config/network concern", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({
        name: "jira.get_issue",
        arguments: { key: "not-a-valid-key" },
      });
      expect(result.isError).toBeTruthy();
    } finally {
      await client.close();
    }
  });
});
