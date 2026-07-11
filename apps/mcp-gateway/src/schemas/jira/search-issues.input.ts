import { z } from "zod";

export const SearchIssuesInputShape = {
  jql: z.string().min(1, "jql must not be empty"),
  maxResults: z.number().int().positive().max(50).optional(),
};

export const SearchIssuesInputSchema = z.object(SearchIssuesInputShape);

export type SearchIssuesInput = z.infer<typeof SearchIssuesInputSchema>;
