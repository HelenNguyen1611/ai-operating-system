import type { TeamAvailabilityConfig } from "./config.js";
import { TeamAvailabilityClient, type TeamAvailabilityClientOptions } from "./client.js";
import { mapRow, zipRow, type TeamAvailabilityEvent } from "./mapper.js";

const TEAM_AVAILABILITY_TIMEZONE = "Asia/Ho_Chi_Minh"; // matches config/runtime.yaml display_timezone
const APPROVED_STATUS = "Approve";
const DEFAULT_TEAM_SCOPE = "all";

export interface GetAvailabilityInput {
  /** YYYY-MM-DD. Defaults to today in TEAM_AVAILABILITY_TIMEZONE. */
  date?: string;
  /** Defaults to "all". */
  teamScope?: string;
}

export interface TeamAvailabilityResult {
  date: string;
  team_scope: string;
  events: TeamAvailabilityEvent[];
  generated_at: string;
  timezone: typeof TEAM_AVAILABILITY_TIMEZONE;
}

function todayInTimezone(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TEAM_AVAILABILITY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Inclusive on both ends — a leave event covering [startDate, endDate] is active on any day in that range. */
function isActiveOnDate(event: TeamAvailabilityEvent, date: string): boolean {
  if (!event.startDate || !event.endDate) return false;
  return event.startDate <= date && date <= event.endDate;
}

export class TeamAvailabilityAdapter {
  private readonly client: TeamAvailabilityClient;

  constructor(
    private readonly config: TeamAvailabilityConfig,
    options: TeamAvailabilityClientOptions = {},
  ) {
    this.client = new TeamAvailabilityClient(config, options);
  }

  async getAvailability(input: GetAvailabilityInput = {}): Promise<TeamAvailabilityResult> {
    const date = input.date ?? todayInTimezone();
    const teamScope = input.teamScope ?? DEFAULT_TEAM_SCOPE;

    const { headers, rows } = await this.client.getTableData(this.config.tableName);

    // team_scope is accepted and echoed back, but not yet used to filter —
    // roster configuration (mapping a scope value to a set of employees) is
    // optional/deferred per the investigation baseline, and no roster
    // format has been defined yet. "all" is the only scope with real
    // behavior today; any other value currently returns the same result as
    // "all". Revisit once a roster format is chosen.
    const events = rows
      .map((row) => mapRow(zipRow(headers, row)))
      .filter((event): event is TeamAvailabilityEvent => event !== null)
      .filter((event) => event.approvalStatus === APPROVED_STATUS)
      .filter((event) => isActiveOnDate(event, date));

    return {
      date,
      team_scope: teamScope,
      events,
      generated_at: new Date().toISOString(),
      timezone: TEAM_AVAILABILITY_TIMEZONE,
    };
  }
}

export function createTeamAvailabilityAdapter(
  config: TeamAvailabilityConfig,
  options?: TeamAvailabilityClientOptions,
): TeamAvailabilityAdapter {
  return new TeamAvailabilityAdapter(config, options);
}

export { todayInTimezone };
export type { TeamAvailabilityEvent } from "./mapper.js";
export type { TeamAvailabilityConfig } from "./config.js";
