import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  SaveDailyReportInputSchema,
  SaveDailyReportInputShape,
} from "../schemas/daily-report/save.input.js";
import { loadJiraConfig } from "../adapters/jira/config.js";
import { createJiraAdapter, type JiraMorningContext } from "../adapters/jira/index.js";
import { loadTeamAvailabilityConfig } from "../adapters/team-availability/config.js";
import { createTeamAvailabilityAdapter, type TeamAvailabilityResult } from "../adapters/team-availability/index.js";
import { loadDailyReportConfig } from "../adapters/daily-report/config.js";
import { createDailyReportAdapter } from "../adapters/daily-report/index.js";
import { buildErrorResult } from "../types/error-envelope.js";
import { mapDailyReportAdapterError } from "./daily-report-error-mapping.js";

/**
 * Best-effort fetch of Jira's current morning context. Never throws — an
 * unconfigured or failing Jira must not block saving the rest of the daily
 * report (see plan: "one broken/unconfigured connector never blocks the
 * save").
 */
async function fetchJira(): Promise<{ jira: JiraMorningContext | null; jiraError?: string }> {
  const config = loadJiraConfig();
  if (!config) {
    return { jira: null, jiraError: "Jira is not configured (ADAPTER_NOT_CONFIGURED)." };
  }
  try {
    const jira = await createJiraAdapter(config).getMorningContext();
    return { jira };
  } catch (error) {
    return { jira: null, jiraError: error instanceof Error ? error.message : String(error) };
  }
}

/** Same best-effort contract as fetchJira() above, for Team Availability. */
async function fetchTeamAvailability(): Promise<{
  teamAvailability: TeamAvailabilityResult | null;
  teamAvailabilityError?: string;
}> {
  const config = loadTeamAvailabilityConfig();
  if (!config) {
    return {
      teamAvailability: null,
      teamAvailabilityError: "Team Availability is not configured (ADAPTER_NOT_CONFIGURED).",
    };
  }
  try {
    const teamAvailability = await createTeamAvailabilityAdapter(config).getAvailability();
    return { teamAvailability };
  } catch (error) {
    return { teamAvailability: null, teamAvailabilityError: error instanceof Error ? error.message : String(error) };
  }
}

export function registerDailyReportSave(server: McpServer): void {
  server.registerTool(
    "daily_report_save",
    {
      title: "Save Daily Report",
      description:
        "Captures today's Jira and Team Availability state (best-effort — a missing or " +
        "failing connector is recorded but never blocks the save) plus an optional verbatim " +
        "brief summary, and writes it to today's local daily-report file. Always saves under " +
        "today's date; re-running the same day overwrites that day's file. Call this once you've " +
        "produced a Morning Brief so it can be read back later via daily_report_get.",
      inputSchema: SaveDailyReportInputShape,
    },
    async (args) => {
      const parsed = SaveDailyReportInputSchema.safeParse(args);
      if (!parsed.success) {
        return buildErrorResult(
          "VALIDATION_FAILED",
          "daily_report",
          `Invalid input: ${parsed.error.message}`,
        );
      }

      const [{ jira, jiraError }, { teamAvailability, teamAvailabilityError }] = await Promise.all([
        fetchJira(),
        fetchTeamAvailability(),
      ]);

      try {
        const adapter = createDailyReportAdapter(loadDailyReportConfig());
        const report = await adapter.save({
          summary: parsed.data.summary,
          jira,
          jiraError,
          teamAvailability,
          teamAvailabilityError,
        });
        return { content: [{ type: "text", text: JSON.stringify(report) }] };
      } catch (error) {
        return mapDailyReportAdapterError(error);
      }
    },
  );
}
