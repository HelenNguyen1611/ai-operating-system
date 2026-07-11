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
}

/**
 * Returns null (never throws) when configuration is incomplete, so the
 * gateway can still boot and serve health_check/morning_brief with no
 * Jira credentials present at all — required by "Keep Phase 1 behaviour
 * unchanged."
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
  };
}
