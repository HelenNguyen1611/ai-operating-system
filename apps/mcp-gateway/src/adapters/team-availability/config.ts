/**
 * Owns Team Availability credential/config resolution, per ARCHITECTURE.md
 * §7 — "an adapter is responsible for its own config validation." Reads
 * process.env directly, same as src/adapters/jira/config.ts — no shared
 * gateway-wide config module.
 *
 * Auth is Microsoft Graph app-only (client credentials grant) against the
 * workbook's drive/item — see client.ts. driveId/itemId (not a folder path)
 * are required because Graph's client-credentials flow has no "current
 * user's OneDrive" concept; the exact drive and item must be resolved out
 * of band (e.g. via Graph Explorer or the workbook's sharing link) and
 * supplied directly. This is an open item from the investigation baseline —
 * see runtime docs / ROADMAP for Team Availability.
 *
 * Never logs a secret. If you add logging here later, redact
 * TEAM_AVAILABILITY_CLIENT_SECRET — do not print it, even partially.
 */
export interface TeamAvailabilityConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  driveId: string;
  itemId: string;
  /** Excel table name (Graph object name, e.g. "OfficeForms.Table"), not the worksheet name. */
  tableName: string;
}

const DEFAULT_TABLE_NAME = "OfficeForms.Table";

/**
 * Returns null (never throws) when required configuration is incomplete,
 * so the gateway can still boot and serve other tools with no Team
 * Availability credentials present at all — same contract as
 * loadJiraConfig(). tableName always has a value (falls back to
 * DEFAULT_TABLE_NAME) since it's a tunable with a safe default, not a
 * credential.
 */
export function loadTeamAvailabilityConfig(env: NodeJS.ProcessEnv = process.env): TeamAvailabilityConfig | null {
  const tenantId = env.TEAM_AVAILABILITY_TENANT_ID?.trim();
  const clientId = env.TEAM_AVAILABILITY_CLIENT_ID?.trim();
  const clientSecret = env.TEAM_AVAILABILITY_CLIENT_SECRET?.trim();
  const driveId = env.TEAM_AVAILABILITY_DRIVE_ID?.trim();
  const itemId = env.TEAM_AVAILABILITY_ITEM_ID?.trim();

  if (!tenantId || !clientId || !clientSecret || !driveId || !itemId) {
    return null;
  }

  const tableName = env.TEAM_AVAILABILITY_TABLE_NAME?.trim() || DEFAULT_TABLE_NAME;

  return { tenantId, clientId, clientSecret, driveId, itemId, tableName };
}
