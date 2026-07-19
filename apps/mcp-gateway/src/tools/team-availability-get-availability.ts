import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  GetAvailabilityInputSchema,
  GetAvailabilityInputShape,
} from "../schemas/team-availability/get-availability.input.js";
import { loadTeamAvailabilityConfig } from "../adapters/team-availability/config.js";
import { createTeamAvailabilityAdapter } from "../adapters/team-availability/index.js";
import { buildErrorResult } from "../types/error-envelope.js";
import { mapTeamAvailabilityAdapterError } from "./team-availability-error-mapping.js";
import { TeamAvailabilityNotConfiguredError } from "../adapters/team-availability/errors.js";

export function registerTeamAvailabilityGetAvailability(server: McpServer): void {
  server.registerTool(
    "team_availability_get_availability",
    {
      title: "Team Availability",
      description:
        "Returns approved leave/availability events active on a given date (default: today), " +
        "read from the authoritative Excel workbook that Power Automate updates after approval. " +
        "Only rows with Approval Status = Approve are included; Reason, uploaded documents, and " +
        "Note are never returned. Read-only — does not read Microsoft Forms directly.",
      inputSchema: GetAvailabilityInputShape,
    },
    async (args) => {
      const parsed = GetAvailabilityInputSchema.safeParse(args);
      if (!parsed.success) {
        return buildErrorResult(
          "VALIDATION_FAILED",
          "team_availability",
          `Invalid input: ${parsed.error.message}`,
        );
      }

      const config = loadTeamAvailabilityConfig();
      if (!config) {
        return buildErrorResult(
          "ADAPTER_NOT_CONFIGURED",
          "team_availability",
          new TeamAvailabilityNotConfiguredError().message,
        );
      }

      try {
        const adapter = createTeamAvailabilityAdapter(config);
        const result = await adapter.getAvailability({
          date: parsed.data.date,
          teamScope: parsed.data.team_scope,
        });
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (error) {
        return mapTeamAvailabilityAdapterError(error);
      }
    },
  );
}
