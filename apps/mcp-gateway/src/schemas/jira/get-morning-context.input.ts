import { z } from "zod";

// No parameters — get_morning_context always queries for the
// currently-authenticated Jira user (JIRA_EMAIL). Kept as an explicit empty
// shape, per ARCHITECTURE.md §9's "one schema pair per tool," rather than
// omitting a schema file for this tool.
export const GetMorningContextInputShape = {};

export const GetMorningContextInputSchema = z.object(GetMorningContextInputShape);

export type GetMorningContextInput = z.infer<typeof GetMorningContextInputSchema>;
