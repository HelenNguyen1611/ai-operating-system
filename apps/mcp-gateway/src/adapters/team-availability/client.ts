import type { TeamAvailabilityConfig } from "./config.js";
import {
  TeamAvailabilityApiError,
  TeamAvailabilityAuthError,
  TeamAvailabilityNotFoundError,
  TeamAvailabilityTimeoutError,
} from "./errors.js";

const DEFAULT_TIMEOUT_MS = 10_000;
const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";
const GRAPH_SCOPE = "https://graph.microsoft.com/.default";

export interface TeamAvailabilityClientOptions {
  /** Injected for tests — never a real network call in the test suite. */
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

/** A single Excel table row as returned by Graph, before header-zipping. */
export interface TeamAvailabilityTableData {
  headers: string[];
  rows: unknown[][];
}

interface GraphTokenResponse {
  access_token: string;
}

interface GraphColumnsResponse {
  value: { name: string; index: number }[];
}

interface GraphRowsResponse {
  value: { index: number; values: unknown[][] }[];
}

/**
 * Thin, read-only wrapper around Microsoft Graph (workbook table access
 * only). Deliberately exposes no write method — there is structurally no
 * postJson/patchJson/deleteJson anywhere in this file, mirroring
 * src/adapters/jira/client.ts's "the capability doesn't exist in code"
 * pattern. This adapter must never write back to the workbook; Power
 * Automate owns writes.
 *
 * Auth: Microsoft Graph app-only client-credentials grant (tenant-wide app
 * registration), not delegated/user auth — there is no interactive user in
 * this flow. A fresh token is requested per TeamAvailabilityClient call;
 * no cross-request token cache, matching the adapter's per-request
 * construction (see index.ts / tool handler).
 */
export class TeamAvailabilityClient {
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor(
    private readonly config: TeamAvailabilityConfig,
    options: TeamAvailabilityClientOptions = {},
  ) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async request(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      return await this.fetchImpl(url, { ...init, signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new TeamAvailabilityTimeoutError(this.timeoutMs);
      }
      throw new TeamAvailabilityApiError(
        null,
        `Network error calling Microsoft Graph: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  private async getAccessToken(): Promise<string> {
    const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(this.config.tenantId)}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: GRAPH_SCOPE,
      grant_type: "client_credentials",
    });

    const response = await this.request(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (response.status === 401 || response.status === 403) {
      throw new TeamAvailabilityAuthError(response.status);
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new TeamAvailabilityApiError(
        response.status,
        `Microsoft identity token request failed (HTTP ${response.status}): ${text.slice(0, 500)}`,
      );
    }

    const json = (await response.json()) as GraphTokenResponse;
    return json.access_token;
  }

  private async getGraphJson<T>(path: string, token: string): Promise<T> {
    const response = await this.request(`${GRAPH_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new TeamAvailabilityAuthError(response.status);
    }
    if (response.status === 404) {
      throw new TeamAvailabilityNotFoundError(path);
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new TeamAvailabilityApiError(
        response.status,
        `Microsoft Graph API error ${response.status}: ${text.slice(0, 500)}`,
      );
    }

    return (await response.json()) as T;
  }

  /**
   * Fetches column names (in table order) and all row values for the given
   * Excel table. Two Graph calls: columns are fetched separately rather
   * than assuming a hardcoded column order, so a reordered (but not
   * renamed) column in the workbook doesn't silently corrupt the mapping —
   * mapper.ts then zips headers[i] -> row[i] by name.
   */
  async getTableData(tableName: string): Promise<TeamAvailabilityTableData> {
    const base = `/drives/${encodeURIComponent(this.config.driveId)}/items/${encodeURIComponent(
      this.config.itemId,
    )}/workbook/tables/${encodeURIComponent(tableName)}`;

    const token = await this.getAccessToken();
    const [columns, rowsResponse] = await Promise.all([
      this.getGraphJson<GraphColumnsResponse>(`${base}/columns`, token),
      this.getGraphJson<GraphRowsResponse>(`${base}/rows`, token),
    ]);

    const headers = [...columns.value].sort((a, b) => a.index - b.index).map((column) => column.name);
    const rows = rowsResponse.value.map((row) => row.values[0] ?? []);

    return { headers, rows };
  }
}
