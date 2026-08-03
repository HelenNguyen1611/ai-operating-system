import { z } from "zod";
import type { JiraMorningContext } from "../jira/index.js";
import type { TeamAvailabilityResult } from "../team-availability/index.js";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * On-disk file contract, one file per calendar day. jira/team_availability
 * are validated only as "present or null" here (z.unknown()) rather than
 * mirrored field-by-field — those shapes are already owned and validated by
 * their own adapters (JiraMorningContext / TeamAvailabilityResult) at the
 * point this file is written; duplicating their schemas here would just be
 * two places that can drift out of sync. This schema's job is to confirm
 * the envelope itself is intact, not to re-validate upstream adapter output.
 */
export const DailyReportSchema = z.object({
  date: z.string().regex(DATE_REGEX, "date must be in YYYY-MM-DD format"),
  generated_at: z.string().datetime({
    offset: true,
    message: "generated_at must be an ISO 8601 timestamp with a UTC offset",
  }),
  summary: z.string().optional(),
  jira: z.unknown().nullable(),
  jira_error: z.string().optional(),
  team_availability: z.unknown().nullable(),
  team_availability_error: z.string().optional(),
});

export type DailyReportFile = z.infer<typeof DailyReportSchema>;

/** Gateway-internal, MCP-facing shape — same fields as DailyReportFile, with jira/team_availability typed precisely. */
export interface DailyReport {
  date: string;
  generated_at: string;
  summary?: string;
  jira: JiraMorningContext | null;
  jira_error?: string;
  team_availability: TeamAvailabilityResult | null;
  team_availability_error?: string;
}

export function buildReport(input: {
  date: string;
  generatedAt: string;
  summary?: string;
  jira: JiraMorningContext | null;
  jiraError?: string;
  teamAvailability: TeamAvailabilityResult | null;
  teamAvailabilityError?: string;
}): DailyReport {
  return {
    date: input.date,
    generated_at: input.generatedAt,
    summary: input.summary,
    jira: input.jira,
    jira_error: input.jiraError,
    team_availability: input.teamAvailability,
    team_availability_error: input.teamAvailabilityError,
  };
}
