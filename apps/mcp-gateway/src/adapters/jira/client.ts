import type { JiraConfig } from "./config.js";
import { JiraApiError, JiraAuthError, JiraNotFoundError, JiraTimeoutError } from "./errors.js";

const DEFAULT_TIMEOUT_MS = 10_000;

export interface JiraClientOptions {
  /** Injected for tests — never a real network call in the test suite. */
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface JiraSearchPage<T> {
  items: T[];
  nextPageToken?: string;
  isLast: boolean;
}

/**
 * Thin, read-only wrapper around the Jira Cloud REST API v3.
 *
 * Deliberately exposes only getJson() — there is structurally no
 * postJson/putJson/deleteJson method anywhere in this file, per
 * ARCHITECTURE.md §7 ("no write requests, no transitions, no comments, no
 * issue updates"). This is the same "the capability doesn't exist in code"
 * pattern used for filesystem writes in Phase 1's morning-brief.ts.
 */
export class JiraClient {
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor(
    private readonly config: JiraConfig,
    options: JiraClientOptions = {},
  ) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async getJson<T>(path: string, searchParams: Record<string, string | number | undefined> = {}): Promise<T> {
    const url = new URL(this.config.baseUrl + path);
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const authHeader =
      "Basic " + Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString("base64");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchImpl(url.toString(), {
        method: "GET",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new JiraTimeoutError(this.timeoutMs);
      }
      throw new JiraApiError(
        null,
        `Network error calling Jira: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 401 || response.status === 403) {
      throw new JiraAuthError(response.status);
    }
    if (response.status === 404) {
      throw new JiraNotFoundError(path);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new JiraApiError(response.status, `Jira API error ${response.status}: ${body.slice(0, 500)}`);
    }

    return (await response.json()) as T;
  }
}

/**
 * Cursor-pagination loop for Jira's /rest/api/3/search/jql response shape
 * (nextPageToken / isLast) — replaces the old startAt/total offset model
 * after Atlassian removed /rest/api/3/search (HTTP 410, migration
 * https://developer.atlassian.com/changelog/#CHANGE-2046). Capped by
 * maxItems as a safety limit — the gateway must never issue an unbounded
 * number of upstream requests for a single tool call.
 */
export async function paginateAll<T>(
  fetchPage: (pageToken: string | undefined) => Promise<JiraSearchPage<T>>,
  options: { maxItems?: number } = {},
): Promise<T[]> {
  const maxItems = options.maxItems ?? 200;
  const results: T[] = [];
  let pageToken: string | undefined;

  // Safety cap on iterations too, independent of maxItems, in case a page
  // ever reports isLast incorrectly (defense against an infinite loop
  // against a misbehaving or unexpectedly-shaped API response).
  for (let pageCount = 0; pageCount < 20; pageCount++) {
    const page = await fetchPage(pageToken);
    results.push(...page.items);

    if (page.items.length === 0) break;
    if (results.length >= maxItems) break;
    if (page.isLast || !page.nextPageToken) break;
    pageToken = page.nextPageToken;
  }

  return results.slice(0, maxItems);
}
