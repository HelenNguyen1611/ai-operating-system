import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createApp } from "../src/server.js";

const ENV_KEYS = [
  "DAILY_REPORT_STORE_DIR",
  "TEAM_AVAILABILITY_SNAPSHOT_PATH",
  "TEAM_AVAILABILITY_MAX_AGE_MINUTES",
  "JIRA_BASE_URL",
  "JIRA_EMAIL",
  "JIRA_API_TOKEN",
] as const;

let httpServer: Server;
let baseUrl: string;
let savedEnv: Record<string, string | undefined>;
let tempStoreDir: string;

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

// Jira/Team Availability are left unconfigured in every test here — the
// daily-report tools must work (best-effort save, or a NOT_FOUND get) even
// with both connectors entirely absent, same rationale as
// tests/team-availability-tools.test.ts.
beforeEach(async () => {
  savedEnv = {};
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  tempStoreDir = await mkdtemp(path.join(tmpdir(), "daily-report-tools-test-"));
  process.env.DAILY_REPORT_STORE_DIR = tempStoreDir;
});

afterEach(async () => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
  await rm(tempStoreDir, { recursive: true, force: true });
});

async function connectMcpClient(): Promise<Client> {
  const client = new Client({ name: "daily-report-tools-test-client", version: "0.0.1" });
  const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
  await client.connect(transport);
  return client;
}

describe("tools/list includes daily_report_save and daily_report_get", () => {
  it("registers both tools", async () => {
    const client = await connectMcpClient();
    try {
      const { tools } = await client.listTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain("daily_report_save");
      expect(names).toContain("daily_report_get");
    } finally {
      await client.close();
    }
  });
});

describe("daily_report_get on an empty store", () => {
  it("returns DAILY_REPORT_NOT_FOUND, not a crash", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({
        name: "daily_report_get",
        arguments: { date: "2020-01-01" },
      });
      expect(result.isError).toBeTruthy();
      const content = result.content as Array<{ type: string; text: string }>;
      const envelope = JSON.parse(content[0].text);
      expect(envelope.error.code).toBe("DAILY_REPORT_NOT_FOUND");
      expect(envelope.error.domain).toBe("daily_report");
    } finally {
      await client.close();
    }
  });

  it("rejects a malformed date before any filesystem concern", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({
        name: "daily_report_get",
        arguments: { date: "not-a-date" },
      });
      expect(result.isError).toBeTruthy();
    } finally {
      await client.close();
    }
  });
});

describe("daily_report_save then daily_report_get — round trip", () => {
  it("saves today's report (Jira/Team Availability unconfigured) and reads it back", async () => {
    const client = await connectMcpClient();
    try {
      const saveResult = await client.callTool({
        name: "daily_report_save",
        arguments: { summary: "Good morning — nothing urgent." },
      });
      expect(saveResult.isError).toBeFalsy();
      const savedContent = saveResult.content as Array<{ type: string; text: string }>;
      const saved = JSON.parse(savedContent[0].text);
      expect(saved.summary).toBe("Good morning — nothing urgent.");
      expect(saved.jira).toBeNull();
      expect(saved.team_availability).toBeNull();

      const getResult = await client.callTool({ name: "daily_report_get", arguments: {} });
      expect(getResult.isError).toBeFalsy();
      const fetchedContent = getResult.content as Array<{ type: string; text: string }>;
      const fetched = JSON.parse(fetchedContent[0].text);
      expect(fetched).toEqual(saved);
    } finally {
      await client.close();
    }
  });
});
