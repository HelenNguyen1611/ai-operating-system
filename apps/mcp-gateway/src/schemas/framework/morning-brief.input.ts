import { z } from "zod";

/**
 * detail levels match commands/_base/morning.base.md and Morning Card defaults.
 * "standard" is the Claude App default when detail is not specified by the user.
 */
export const MorningBriefInputShape = {
  language: z.enum(["en", "vi"]),
  detail: z.enum(["brief", "standard", "full"]),
};

export const MorningBriefInputSchema = z.object(MorningBriefInputShape);

export type MorningBriefInput = z.infer<typeof MorningBriefInputSchema>;
