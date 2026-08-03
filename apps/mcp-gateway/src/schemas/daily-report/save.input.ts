import { z } from "zod";

export const SaveDailyReportInputShape = {
  /** Optional verbatim brief text the client just produced, stored alongside the structured Jira/Team-Availability data for that day. */
  summary: z.string().optional(),
};

export const SaveDailyReportInputSchema = z.object(SaveDailyReportInputShape);

export type SaveDailyReportInput = z.infer<typeof SaveDailyReportInputSchema>;
