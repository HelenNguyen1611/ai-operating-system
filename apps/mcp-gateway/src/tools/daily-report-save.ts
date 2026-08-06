import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  SaveDailyReportInputSchema,
  SaveDailyReportInputShape,
} from "../schemas/daily-report/save.input.js";
import { loadDailyReportConfig } from "../adapters/daily-report/config.js";
import { createDailyReportAdapter } from "../adapters/daily-report/index.js";
import { buildErrorResult } from "../types/error-envelope.js";
import { mapDailyReportAdapterError } from "./daily-report-error-mapping.js";
import { fetchMorningLiveContext } from "../lib/live-context-fetch.js";

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

      const live = await fetchMorningLiveContext();

      try {
        const adapter = createDailyReportAdapter(loadDailyReportConfig());
        const report = await adapter.save({
          summary: parsed.data.summary,
          jira: live.jira,
          jiraError: live.jira_error,
          teamAvailability: live.team_availability,
          teamAvailabilityError: live.team_availability_error,
        });
        return { content: [{ type: "text", text: JSON.stringify(report) }] };
      } catch (error) {
        return mapDailyReportAdapterError(error);
      }
    },
  );
}
