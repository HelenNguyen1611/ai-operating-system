import { parseMaxAgeMinutes, type TeamAvailabilityConfig } from "./config.js";
import { TeamAvailabilitySnapshotReader, type TeamAvailabilitySnapshotReaderOptions } from "./client.js";
import { isActiveOnDate, mapPerson, type TeamAvailabilityEvent } from "./mapper.js";
import { TeamAvailabilityConfigInvalidError, TeamAvailabilitySnapshotStaleError } from "./errors.js";
import { getDisplayTimezone, RuntimeConfigInvalidError } from "../../lib/runtime-config.js";

const APPROVED_TEAM_SCOPE = "all";

export interface GetAvailabilityInput {
  /** YYYY-MM-DD. Defaults to today in the timezone configured by config/runtime.yaml's output.display_timezone. */
  date?: string;
  /** Only "all" is supported for MVP — enforced by the tool's input schema (z.enum(["all"])). */
  teamScope?: "all";
}

export interface TeamAvailabilityResult {
  date: string;
  team_scope: string;
  events: TeamAvailabilityEvent[];
  /** Passed through from the snapshot itself — when the underlying data was generated, not when this tool call ran. */
  generated_at: string;
  timezone: string;
}

export interface TeamAvailabilityAdapterOptions extends TeamAvailabilitySnapshotReaderOptions {
  /**
   * Injected for tests — defaults to lib/runtime-config.ts's
   * getDisplayTimezone(), which reads this repo's real
   * config/runtime.yaml. Tests that care about timezone-dependent
   * behavior (e.g. UTC/HCM day-boundary math) should supply this instead
   * of relying on the real file's contents, the same way readFileImpl
   * lets snapshot tests avoid touching the real filesystem.
   */
  resolveDisplayTimezone?: () => Promise<string>;
}

/**
 * Reuses Morning Brief's own configured timezone (config/runtime.yaml's
 * output.display_timezone) rather than introducing a Team
 * Availability-specific setting. Always resolved, even when the caller
 * supplies an explicit date — this is also where a misconfigured
 * output.display_timezone surfaces as ADAPTER_CONFIG_INVALID, and that
 * check must not be skippable just by passing an explicit date.
 */
async function resolveTodayInConfiguredTimezone(
  resolveDisplayTimezone: () => Promise<string>,
): Promise<{ date: string; timezone: string }> {
  let timezone: string;
  try {
    timezone = await resolveDisplayTimezone();
  } catch (error) {
    if (error instanceof RuntimeConfigInvalidError) {
      throw new TeamAvailabilityConfigInvalidError(error.configKey, error.message);
    }
    throw error;
  }

  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return { date, timezone };
}

export class TeamAvailabilityAdapter {
  private readonly reader: TeamAvailabilitySnapshotReader;
  private readonly resolveDisplayTimezone: () => Promise<string>;

  constructor(
    private readonly config: TeamAvailabilityConfig,
    options: TeamAvailabilityAdapterOptions = {},
  ) {
    this.reader = new TeamAvailabilitySnapshotReader(options);
    this.resolveDisplayTimezone = options.resolveDisplayTimezone ?? getDisplayTimezone;
  }

  async getAvailability(input: GetAvailabilityInput = {}): Promise<TeamAvailabilityResult> {
    const maxAge = parseMaxAgeMinutes(this.config.maxAgeMinutesRaw);
    if (maxAge.kind === "invalid") {
      throw new TeamAvailabilityConfigInvalidError(
        "TEAM_AVAILABILITY_MAX_AGE_MINUTES",
        `TEAM_AVAILABILITY_MAX_AGE_MINUTES="${maxAge.raw}" must be a positive integer.`,
      );
    }

    const { date: today, timezone } = await resolveTodayInConfiguredTimezone(this.resolveDisplayTimezone);
    const date = input.date ?? today;
    const teamScope = input.teamScope ?? APPROVED_TEAM_SCOPE;

    const snapshot = await this.reader.readSnapshot(this.config.snapshotPath);

    if (maxAge.kind === "enabled") {
      const ageMs = Date.now() - Date.parse(snapshot.generated_at);
      if (ageMs > maxAge.minutes * 60_000) {
        throw new TeamAvailabilitySnapshotStaleError(snapshot.generated_at, maxAge.minutes);
      }
    }

    const events = snapshot.people.map(mapPerson).filter((event) => isActiveOnDate(event, date));

    return {
      date,
      team_scope: teamScope,
      events,
      generated_at: snapshot.generated_at,
      timezone,
    };
  }
}

export function createTeamAvailabilityAdapter(
  config: TeamAvailabilityConfig,
  options?: TeamAvailabilityAdapterOptions,
): TeamAvailabilityAdapter {
  return new TeamAvailabilityAdapter(config, options);
}

export type { TeamAvailabilityEvent } from "./mapper.js";
export type { TeamAvailabilityConfig } from "./config.js";
