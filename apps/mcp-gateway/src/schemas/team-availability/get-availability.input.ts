import { z } from "zod";

export const GetAvailabilityInputShape = {
  /** YYYY-MM-DD. Defaults to today (adapter-side) when omitted. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format").optional(),
  /** Defaults to "all" (adapter-side) when omitted. */
  team_scope: z.string().min(1, "team_scope must not be empty").optional(),
};

export const GetAvailabilityInputSchema = z.object(GetAvailabilityInputShape);

export type GetAvailabilityInput = z.infer<typeof GetAvailabilityInputSchema>;
