/**
 * Owns Team Availability config resolution, per ARCHITECTURE.md §7 — "an
 * adapter is responsible for its own config validation." Reads
 * process.env directly, same as src/adapters/jira/config.ts — no shared
 * gateway-wide config module.
 *
 * The data source is a local JSON file (a OneDrive-synced folder in
 * production) that Power Automate writes after filtering the source Excel
 * workbook to approved rows — see mapper.ts for the snapshot contract.
 * There is no Microsoft Graph / Azure AD credential involved.
 */
export interface TeamAvailabilityConfig {
  snapshotPath: string;
  /** Raw env value, unparsed — see parseMaxAgeMinutes(). Deliberately not resolved here (see that function's doc comment). */
  maxAgeMinutesRaw: string | undefined;
}

/**
 * Returns null (never throws) when TEAM_AVAILABILITY_SNAPSHOT_PATH is
 * unset, so the gateway can still boot and serve other tools with Team
 * Availability entirely unconfigured — same contract as loadJiraConfig().
 */
export function loadTeamAvailabilityConfig(env: NodeJS.ProcessEnv = process.env): TeamAvailabilityConfig | null {
  const snapshotPath = env.TEAM_AVAILABILITY_SNAPSHOT_PATH?.trim();
  if (!snapshotPath) {
    return null;
  }

  return { snapshotPath, maxAgeMinutesRaw: env.TEAM_AVAILABILITY_MAX_AGE_MINUTES };
}

export type MaxAgeResult =
  | { kind: "disabled" }
  | { kind: "enabled"; minutes: number }
  | { kind: "invalid"; raw: string };

/**
 * Deliberately separate from loadTeamAvailabilityConfig(): config loading
 * never throws (boot must never fail), but an invalid max-age value is a
 * real misconfiguration that must not be silently downgraded to
 * "disabled" — the caller (TeamAvailabilityAdapter) turns "invalid" into a
 * thrown TeamAvailabilityConfigInvalidError at call time instead, per the
 * "surface it, don't hide it" requirement.
 */
export function parseMaxAgeMinutes(raw: string | undefined): MaxAgeResult {
  if (raw === undefined || raw.trim() === "") {
    return { kind: "disabled" };
  }

  const trimmed = raw.trim();
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return { kind: "invalid", raw: trimmed };
  }

  return { kind: "enabled", minutes: parsed };
}
