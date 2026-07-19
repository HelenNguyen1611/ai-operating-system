import { describe, expect, it } from "vitest";
import { loadTeamAvailabilityConfig } from "../../src/adapters/team-availability/config.js";
import { createTeamAvailabilityAdapter, todayInTimezone } from "../../src/adapters/team-availability/index.js";
import {
  TeamAvailabilityApiError,
  TeamAvailabilityAuthError,
  TeamAvailabilityNotFoundError,
  TeamAvailabilityTimeoutError,
} from "../../src/adapters/team-availability/errors.js";

const VALID_CONFIG = {
  tenantId: "tenant-1",
  clientId: "client-1",
  clientSecret: "secret-1",
  driveId: "drive-1",
  itemId: "item-1",
  tableName: "OfficeForms.Table",
};

const HEADERS = [
  "Id",
  "InternalId",
  "Start time",
  "Completion time",
  "Email",
  "Name",
  "Full name",
  "Leave type",
  "Start date",
  "End date",
  "Total of hours of leave",
  "Reason",
  "Upload relevant documents here",
  "Leave approver",
  "Note",
  "Approval Status",
];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function textResponse(body: string, status: number): Response {
  return new Response(body, { status });
}

/** Builds a fetchImpl that serves the token endpoint, then columns/rows for the given raw rows. */
function buildFetchImpl(rows: unknown[][]) {
  return (async (url: RequestInfo | URL) => {
    const u = new URL(url as string);

    if (u.hostname === "login.microsoftonline.com") {
      return jsonResponse({ access_token: "test-token", expires_in: 3600 });
    }

    if (u.pathname.endsWith("/columns")) {
      return jsonResponse({
        value: HEADERS.map((name, index) => ({ name, index })),
      });
    }

    if (u.pathname.endsWith("/rows")) {
      return jsonResponse({
        value: rows.map((values, index) => ({ index, values: [values] })),
      });
    }

    throw new Error(`Unexpected URL in test fetchImpl: ${u.toString()}`);
  }) as typeof fetch;
}

function rowFor(overrides: Partial<Record<string, string | number | null>>): unknown[] {
  const record: Record<string, unknown> = {
    Id: "1",
    InternalId: "1",
    "Start time": "2026-07-01T00:00:00Z",
    "Completion time": "2026-07-01T01:00:00Z",
    Email: "helen@wootech.co",
    Name: "Helen",
    "Full name": "Helen Nguyen",
    "Leave type": "Annual Leave",
    "Start date": "2026-07-18",
    "End date": "2026-07-20",
    "Total of hours of leave": 24,
    Reason: "Personal trip",
    "Upload relevant documents here": "https://example.com/doc.pdf",
    "Leave approver": "Manager Name",
    Note: "Internal note",
    "Approval Status": "Approve",
    ...overrides,
  };
  return HEADERS.map((header) => record[header]);
}

// --- Configuration -----------------------------------------------------

describe("loadTeamAvailabilityConfig — valid configuration", () => {
  it("returns a config when all required env vars are set", () => {
    const config = loadTeamAvailabilityConfig({
      TEAM_AVAILABILITY_TENANT_ID: "tenant-1",
      TEAM_AVAILABILITY_CLIENT_ID: "client-1",
      TEAM_AVAILABILITY_CLIENT_SECRET: "secret-1",
      TEAM_AVAILABILITY_DRIVE_ID: "drive-1",
      TEAM_AVAILABILITY_ITEM_ID: "item-1",
    });

    expect(config).toEqual({
      tenantId: "tenant-1",
      clientId: "client-1",
      clientSecret: "secret-1",
      driveId: "drive-1",
      itemId: "item-1",
      tableName: "OfficeForms.Table",
    });
  });

  it("accepts a custom table name", () => {
    const config = loadTeamAvailabilityConfig({
      TEAM_AVAILABILITY_TENANT_ID: "tenant-1",
      TEAM_AVAILABILITY_CLIENT_ID: "client-1",
      TEAM_AVAILABILITY_CLIENT_SECRET: "secret-1",
      TEAM_AVAILABILITY_DRIVE_ID: "drive-1",
      TEAM_AVAILABILITY_ITEM_ID: "item-1",
      TEAM_AVAILABILITY_TABLE_NAME: "CustomTable",
    });

    expect(config?.tableName).toBe("CustomTable");
  });
});

describe("loadTeamAvailabilityConfig — missing configuration", () => {
  it("returns null when TEAM_AVAILABILITY_ITEM_ID is missing", () => {
    const config = loadTeamAvailabilityConfig({
      TEAM_AVAILABILITY_TENANT_ID: "tenant-1",
      TEAM_AVAILABILITY_CLIENT_ID: "client-1",
      TEAM_AVAILABILITY_CLIENT_SECRET: "secret-1",
      TEAM_AVAILABILITY_DRIVE_ID: "drive-1",
    });
    expect(config).toBeNull();
  });

  it("returns null when no env vars are set at all", () => {
    expect(loadTeamAvailabilityConfig({})).toBeNull();
  });
});

// --- getAvailability — filtering ----------------------------------------

describe("TeamAvailabilityAdapter.getAvailability — Approval Status filtering", () => {
  it("includes only rows where Approval Status = Approve", async () => {
    const rows = [
      rowFor({ "Full name": "Approved Person", "Approval Status": "Approve" }),
      rowFor({ "Full name": "Pending Person", "Approval Status": "Pending" }),
      rowFor({ "Full name": "Rejected Person", "Approval Status": "Reject" }),
    ];

    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl: buildFetchImpl(rows) });
    const result = await adapter.getAvailability({ date: "2026-07-19" });

    expect(result.events.map((e) => e.employeeName)).toEqual(["Approved Person"]);
  });
});

describe("TeamAvailabilityAdapter.getAvailability — active-for-date filtering", () => {
  it("includes an event whose range covers the requested date, inclusive", async () => {
    const rows = [rowFor({ "Start date": "2026-07-18", "End date": "2026-07-20" })];
    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl: buildFetchImpl(rows) });

    expect((await adapter.getAvailability({ date: "2026-07-18" })).events).toHaveLength(1);
    expect((await adapter.getAvailability({ date: "2026-07-19" })).events).toHaveLength(1);
    expect((await adapter.getAvailability({ date: "2026-07-20" })).events).toHaveLength(1);
  });

  it("excludes an event outside its date range", async () => {
    const rows = [rowFor({ "Start date": "2026-07-18", "End date": "2026-07-20" })];
    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl: buildFetchImpl(rows) });

    expect((await adapter.getAvailability({ date: "2026-07-21" })).events).toHaveLength(0);
    expect((await adapter.getAvailability({ date: "2026-07-17" })).events).toHaveLength(0);
  });

  it("defaults to today when no date is provided", async () => {
    const today = todayInTimezone();
    const rows = [rowFor({ "Start date": today, "End date": today })];
    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl: buildFetchImpl(rows) });

    const result = await adapter.getAvailability();
    expect(result.date).toBe(today);
    expect(result.events).toHaveLength(1);
  });
});

describe("TeamAvailabilityAdapter.getAvailability — sensitive field exclusion", () => {
  it("never includes Reason, uploaded documents, or Note in mapped output", async () => {
    const rows = [rowFor({})];
    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl: buildFetchImpl(rows) });

    const result = await adapter.getAvailability({ date: "2026-07-19" });
    const event = result.events[0] as unknown as Record<string, unknown>;

    expect(event).not.toHaveProperty("reason");
    expect(event).not.toHaveProperty("note");
    expect(event).not.toHaveProperty("uploadedDocuments");
    expect(JSON.stringify(result)).not.toContain("Personal trip");
    expect(JSON.stringify(result)).not.toContain("Internal note");
    expect(JSON.stringify(result)).not.toContain("doc.pdf");
  });
});

describe("TeamAvailabilityAdapter.getAvailability — field mapping", () => {
  it("maps confirmed workbook columns onto the expected output fields", async () => {
    const rows = [
      rowFor({
        Email: "helen@wootech.co",
        "Full name": "Helen Nguyen",
        "Leave type": "Annual Leave",
        "Start date": "2026-07-18",
        "End date": "2026-07-20",
        "Total of hours of leave": 24,
        "Leave approver": "Manager Name",
        "Completion time": "2026-07-01T01:00:00Z",
      }),
    ];
    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl: buildFetchImpl(rows) });

    const result = await adapter.getAvailability({ date: "2026-07-19" });

    expect(result.events[0]).toEqual({
      employeeName: "Helen Nguyen",
      employeeEmail: "helen@wootech.co",
      leaveType: "Annual Leave",
      startDate: "2026-07-18",
      endDate: "2026-07-20",
      totalHours: 24,
      approver: "Manager Name",
      submittedDate: "2026-07-01",
      approvalStatus: "Approve",
    });
  });

  it("falls back to Name when Full name is blank", async () => {
    const rows = [rowFor({ "Full name": "", Name: "Helen" })];
    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl: buildFetchImpl(rows) });

    const result = await adapter.getAvailability({ date: "2026-07-19" });
    expect(result.events[0].employeeName).toBe("Helen");
  });
});

describe("TeamAvailabilityAdapter.getAvailability — team_scope", () => {
  it("defaults team_scope to 'all' when not provided", async () => {
    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl: buildFetchImpl([]) });
    const result = await adapter.getAvailability({ date: "2026-07-19" });
    expect(result.team_scope).toBe("all");
  });

  it("echoes back an explicitly requested team_scope", async () => {
    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl: buildFetchImpl([]) });
    const result = await adapter.getAvailability({ date: "2026-07-19", teamScope: "engineering" });
    expect(result.team_scope).toBe("engineering");
  });
});

// --- Graph API failure ---------------------------------------------------

describe("TeamAvailabilityClient — Microsoft Graph failure", () => {
  it("throws TeamAvailabilityAuthError when the token endpoint returns 401", async () => {
    const fetchImpl = (async (url: RequestInfo | URL) => {
      const u = new URL(url as string);
      if (u.hostname === "login.microsoftonline.com") return textResponse("unauthorized", 401);
      throw new Error("should not reach Graph without a token");
    }) as typeof fetch;

    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl });
    await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
      TeamAvailabilityAuthError,
    );
  });

  it("throws TeamAvailabilityNotFoundError for a 404 on the table columns", async () => {
    const fetchImpl = (async (url: RequestInfo | URL) => {
      const u = new URL(url as string);
      if (u.hostname === "login.microsoftonline.com") {
        return jsonResponse({ access_token: "test-token", expires_in: 3600 });
      }
      return textResponse("not found", 404);
    }) as typeof fetch;

    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl });
    await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
      TeamAvailabilityNotFoundError,
    );
  });

  it("throws TeamAvailabilityApiError for a 500 response", async () => {
    const fetchImpl = (async (url: RequestInfo | URL) => {
      const u = new URL(url as string);
      if (u.hostname === "login.microsoftonline.com") {
        return jsonResponse({ access_token: "test-token", expires_in: 3600 });
      }
      return textResponse("internal error", 500);
    }) as typeof fetch;

    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, { fetchImpl });
    await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
      TeamAvailabilityApiError,
    );
  });
});

describe("TeamAvailabilityClient — timeout", () => {
  it("throws TeamAvailabilityTimeoutError when the request never resolves before the timeout", async () => {
    const neverResolvingFetch = ((_url: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const abortError = new Error("The operation was aborted");
          abortError.name = "AbortError";
          reject(abortError);
        });
      })) as typeof fetch;

    const adapter = createTeamAvailabilityAdapter(VALID_CONFIG, {
      fetchImpl: neverResolvingFetch,
      timeoutMs: 30,
    });

    await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
      TeamAvailabilityTimeoutError,
    );
  });
});
