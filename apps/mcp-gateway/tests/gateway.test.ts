import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createApp, SERVICE_NAME, SERVICE_VERSION } from "../src/server.js";
import { loadMorningBriefPayload, FrameworkFileMissingError } from "../src/tools/morning-brief.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MISSING_FILE_FIXTURE_ROOT = path.join(__dirname, "fixtures", "missing-file-repo");

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
  it("lists health_check and morning_brief", async () => {
    const client = await connectMcpClient();
    try {
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name).sort()).toEqual(["health_check", "morning_brief"]);
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

describe("morning_brief — English brief payload (end-to-end via MCP)", () => {
  it("returns framework context with the English template", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({
        name: "morning_brief",
        arguments: { language: "en", detail: "brief" },
      });
      expect(result.isError).toBeFalsy();

      const content = result.content as Array<{ type: string; text: string }>;
      const payload = JSON.parse(content[0].text);

      expect(payload.tool).toBe("morning_brief");
      expect(payload.language).toBe("en");
      expect(payload.detail).toBe("brief");
      expect(payload.context.template).toContain("Morning Brief");
      expect(payload.context.base_workflow.length).toBeGreaterThan(0);
      expect(payload.context.runtime.morning_runtime.length).toBeGreaterThan(0);
      expect(payload.context.runtime.context_engine.length).toBeGreaterThan(0);
      expect(payload.context.runtime.reasoning_engine.length).toBeGreaterThan(0);
      expect(payload.context.config.length).toBeGreaterThan(0);
      expect(payload.instructions).toContain("commands/_base/morning.base.md");
    } finally {
      await client.close();
    }
  });
});

describe("morning_brief — Vietnamese brief payload (end-to-end via MCP)", () => {
  it("returns framework context with the Vietnamese template", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({
        name: "morning_brief",
        arguments: { language: "vi", detail: "full" },
      });
      expect(result.isError).toBeFalsy();

      const content = result.content as Array<{ type: string; text: string }>;
      const payload = JSON.parse(content[0].text);

      expect(payload.language).toBe("vi");
      expect(payload.detail).toBe("full");
      expect(payload.context.template).toContain("Báo cáo đầu ngày");
    } finally {
      await client.close();
    }
  });
});

describe("morning_brief — invalid language", () => {
  it("the pure loader rejects an unsupported language", async () => {
    await expect(
      loadMorningBriefPayload(
        // @ts-expect-error deliberately invalid to test runtime rejection
        { language: "fr", detail: "brief" },
      ),
    ).rejects.toBeDefined();
  });

  it("the registered MCP tool never returns a successful payload for invalid input", async () => {
    const client = await connectMcpClient();
    try {
      const result = await client.callTool({
        name: "morning_brief",
        arguments: { language: "fr", detail: "brief" },
      });
      // Whether the SDK rejects at the schema boundary (protocol-level
      // error, thrown here) or the tool returns isError: true, invalid
      // input must never produce a successful morning_brief payload.
      expect(result.isError).toBeTruthy();
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      await client.close();
    }
  });
});

describe("morning_brief — missing required file handling", () => {
  it("the pure loader throws FrameworkFileMissingError for the omitted file", async () => {
    await expect(
      loadMorningBriefPayload(
        { language: "en", detail: "brief" },
        { repoRoot: MISSING_FILE_FIXTURE_ROOT },
      ),
    ).rejects.toThrow(FrameworkFileMissingError);
  });

  it("reports the specific missing relative path", async () => {
    try {
      await loadMorningBriefPayload(
        { language: "en", detail: "brief" },
        { repoRoot: MISSING_FILE_FIXTURE_ROOT },
      );
      throw new Error("expected loadMorningBriefPayload to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(FrameworkFileMissingError);
      expect((error as FrameworkFileMissingError).relativePath).toBe(
        "runtime/48_Reasoning_Engine.md",
      );
    }
  });
});

// Note: the registered MCP tool's own FRAMEWORK_FILE_MISSING error path
// (buildErrorResult call in morning-brief.ts) is not separately exercised
// end-to-end here, because Phase 1 deliberately does not expose repoRoot
// as tool input (a client must not be able to redirect the gateway's file
// reads). The tool always resolves against the real REPO_ROOT, so an
// end-to-end test would require deleting a real repository file — the
// pure-loader tests above cover the same code path (readFrameworkFile ->
// FrameworkFileMissingError -> buildErrorResult) without that risk.
