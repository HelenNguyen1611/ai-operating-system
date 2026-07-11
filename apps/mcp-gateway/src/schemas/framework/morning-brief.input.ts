import { z } from "zod";

/**
 * Phase 1 intentionally supports only "brief" and "full", not the
 * "standard" detail level that commands/_base/morning.base.md defines.
 * Documented simplification — see ARCHITECTURE.md / ROADMAP.md Phase 1
 * entry. Widening to include "standard" is a candidate follow-up, not
 * done here since the tool contract was specified exactly this way.
 */
export const MorningBriefInputShape = {
  language: z.enum(["en", "vi"]),
  detail: z.enum(["brief", "full"]),
};

export const MorningBriefInputSchema = z.object(MorningBriefInputShape);

export type MorningBriefInput = z.infer<typeof MorningBriefInputSchema>;
