import { z } from "zod";

export const GetIssueInputShape = {
  key: z
    .string()
    .min(1)
    .regex(/^[A-Z][A-Z0-9]*-\d+$/, "key must look like an issue key, e.g. TRIN-79"),
};

export const GetIssueInputSchema = z.object(GetIssueInputShape);

export type GetIssueInput = z.infer<typeof GetIssueInputSchema>;
