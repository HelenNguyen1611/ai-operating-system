import { z } from "zod";

export const GetDailyReportInputShape = {
  /** YYYY-MM-DD. Defaults to today (timezone from config/runtime.yaml's output.display_timezone) when omitted. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format").optional(),
};

export const GetDailyReportInputSchema = z.object(GetDailyReportInputShape);

export type GetDailyReportInput = z.infer<typeof GetDailyReportInputSchema>;
