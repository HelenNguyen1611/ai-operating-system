/**
 * Owns Jira credential/config resolution, per ARCHITECTURE.md §7 — "an
 * adapter is responsible for its own config validation." Reads process.env
 * directly; there is no gateway-wide config module and no .env auto-loader
 * (deliberate Phase 2 decision — see ROADMAP.md Phase 2 and .env.example).
 *
 * Never logs a token. If you add logging here later, redact
 * JIRA_API_TOKEN — do not print it, even partially.
 */
export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  /**
   * How many days back getMorningContext()'s JQL looks (`updated >= -Nd`).
   * Unlike baseUrl/email/apiToken, this field always has a value — an
   * invalid or missing MORNING_CONTEXT_LOOKBACK_DAYS does not cause
   * loadJiraConfig() to return null, it falls back to DEFAULT_LOOKBACK_DAYS.
   * Credentials are a hard requirement (no sane default exists); a lookback
   * window is a tunable with a safe default, so the two fields are
   * deliberately validated differently within the same function.
   */
  lookbackDays: number;
}

const DEFAULT_LOOKBACK_DAYS = 30;
const MAX_LOOKBACK_DAYS = 365;

/**
 * Accepts only a positive integer, capped at MAX_LOOKBACK_DAYS. Anything
 * else — missing, non-numeric, decimal, zero, negative, or greater than
 * the cap — falls back to DEFAULT_LOOKBACK_DAYS. Never throws.
 */
function parseLookbackDays(raw: string | undefined): number {
  if (raw === undefined) {
    return DEFAULT_LOOKBACK_DAYS;
  }

  const trimmed = raw.trim();
  // Number("") is 0 and Number(" ") is 0 — guard explicitly rather than
  // relying on Number.isInteger(0) below to reject it for the right reason.
  if (trimmed === "") {
    return DEFAULT_LOOKBACK_DAYS;
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > MAX_LOOKBACK_DAYS) {
    return DEFAULT_LOOKBACK_DAYS;
  }

  return parsed;
}

/**
 * Returns null (never throws) when required configuration is incomplete,
 * so the gateway can still boot and serve health_check/morning_brief with
 * no Jira credentials present at all — required by "Keep Phase 1 behaviour
 * unchanged." lookbackDays is resolved independently and never causes a
 * null return — see parseLookbackDays().
 */
export function loadJiraConfig(env: NodeJS.ProcessEnv = process.env): JiraConfig | null {
  const baseUrl = env.JIRA_BASE_URL?.trim();
  const email = env.JIRA_EMAIL?.trim();
  const apiToken = env.JIRA_API_TOKEN?.trim();

  if (!baseUrl || !email || !apiToken) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    email,
    apiToken,
    lookbackDays: parseLookbackDays(env.MORNING_CONTEXT_LOOKBACK_DAYS),
  };
}
