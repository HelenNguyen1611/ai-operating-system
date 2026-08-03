import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  GetDailyReportInputSchema,
  GetDailyReportInputShape,
} from "../schemas/daily-report/get.input.js";
import { loadDailyReportConfig } from "../adapters/daily-report/config.js";
import { createDailyReportAdapter } from "../adapters/daily-report/index.js";
import { buildErrorResult } from "../types/error-envelope.js";
import { mapDailyReportAdapterError } from "./daily-report-error-mapping.js";

export function registerDailyReportGet(server: McpServer): void {
  server.registerTool(
    "daily_report_get",
    {
      title: "Get Daily Report",
      description:
        "Reads back the daily report saved for a given date (default: today) — the Jira and " +
        "Team Availability state captured by daily_report_save, plus any verbatim summary text. " +
        "Use this instead of live connectors when asked about a past date; there is no data for " +
        "a date that was never saved. Read-only.",
      inputSchema: GetDailyReportInputShape,
    },
    async (args) => {
      const parsed = GetDailyReportInputSchema.safeParse(args);
      if (!parsed.success) {
        return buildErrorResult(
          "VALIDATION_FAILED",
          "daily_report",
          `Invalid input: ${parsed.error.message}`,
        );
      }

      try {
        const adapter = createDailyReportAdapter(loadDailyReportConfig());
        const report = await adapter.get({ date: parsed.data.date });
        return { content: [{ type: "text", text: JSON.stringify(report) }] };
      } catch (error) {
        return mapDailyReportAdapterError(error);
      }
    },
  );
}
