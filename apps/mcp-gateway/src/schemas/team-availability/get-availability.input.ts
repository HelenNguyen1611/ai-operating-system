import { z } from "zod";

export const GetAvailabilityInputShape = {
  /** YYYY-MM-DD. Defaults to today (timezone from config/runtime.yaml's output.display_timezone) when omitted. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format").optional(),
  /** Only "all" is supported for MVP — no roster/team-membership resolution exists yet. Rejected, not silently coerced, at the schema layer. */
  team_scope: z.enum(["all"]).optional(),
};

export const GetAvailabilityInputSchema = z.object(GetAvailabilityInputShape);

export type GetAvailabilityInput = z.infer<typeof GetAvailabilityInputSchema>;
