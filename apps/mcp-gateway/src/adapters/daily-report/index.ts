import type { DailyReportConfig } from "./config.js";
import { DailyReportStore, type DailyReportStoreOptions } from "./client.js";
import { buildReport, type DailyReport } from "./mapper.js";
import { getDisplayTimezone } from "../../lib/runtime-config.js";
import type { JiraMorningContext } from "../jira/index.js";
import type { TeamAvailabilityResult } from "../team-availability/index.js";

export interface SaveDailyReportInput {
  summary?: string;
  jira: JiraMorningContext | null;
  jiraError?: string;
  teamAvailability: TeamAvailabilityResult | null;
  teamAvailabilityError?: string;
}

export interface GetDailyReportInput {
  /** YYYY-MM-DD. Defaults to today in the timezone configured by config/runtime.yaml's output.display_timezone. */
  date?: string;
}

export interface DailyReportAdapterOptions extends DailyReportStoreOptions {
  /** Injected for tests — same pattern as TeamAvailabilityAdapterOptions. */
  resolveDisplayTimezone?: () => Promise<string>;
}

/**
 * Resolves "today" the same way team-availability/index.ts does — reusing
 * Morning Brief's own configured timezone (config/runtime.yaml's
 * output.display_timezone) rather than introducing a Daily-Report-specific
 * setting, so a report saved "today" and a Team Availability query for
 * "today" always agree on what day that is.
 */
async function resolveToday(resolveDisplayTimezone: () => Promise<string>): Promise<string> {
  const timezone = await resolveDisplayTimezone();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export class DailyReportAdapter {
  private readonly store: DailyReportStore;
  private readonly resolveDisplayTimezone: () => Promise<string>;

  constructor(
    private readonly config: DailyReportConfig,
    options: DailyReportAdapterOptions = {},
  ) {
    this.store = new DailyReportStore(options);
    this.resolveDisplayTimezone = options.resolveDisplayTimezone ?? getDisplayTimezone;
  }

  /** Always saves under today's date — there is no historical backfill; see plan's non-goals. Last write wins per day. */
  async save(input: SaveDailyReportInput): Promise<DailyReport> {
    const date = await resolveToday(this.resolveDisplayTimezone);
    const report = buildReport({
      date,
      generatedAt: new Date().toISOString(),
      summary: input.summary,
      jira: input.jira,
      jiraError: input.jiraError,
      teamAvailability: input.teamAvailability,
      teamAvailabilityError: input.teamAvailabilityError,
    });
    await this.store.write(this.config.storeDir, report);
    return report;
  }

  async get(input: GetDailyReportInput = {}): Promise<DailyReport> {
    const date = input.date ?? (await resolveToday(this.resolveDisplayTimezone));
    return this.store.read(this.config.storeDir, date);
  }
}

export function createDailyReportAdapter(
  config: DailyReportConfig,
  options?: DailyReportAdapterOptions,
): DailyReportAdapter {
  return new DailyReportAdapter(config, options);
}

export type { DailyReport } from "./mapper.js";
export type { DailyReportConfig } from "./config.js";
