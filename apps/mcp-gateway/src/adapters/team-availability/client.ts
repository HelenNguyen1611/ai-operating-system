import { readFile } from "node:fs/promises";
import {
  TeamAvailabilitySnapshotInvalidError,
  TeamAvailabilitySnapshotNotFoundError,
  TeamAvailabilitySnapshotReadFailedError,
} from "./errors.js";
import { SnapshotSchema, type Snapshot } from "./mapper.js";

export interface TeamAvailabilitySnapshotReaderOptions {
  /** Injected for tests — reads a real file by default. */
  readFileImpl?: (path: string, encoding: "utf-8") => Promise<string>;
}

/**
 * Thin, read-only wrapper around the local snapshot file (a OneDrive-synced
 * folder in production). Deliberately exposes no write method — there is
 * structurally no writeSnapshot() anywhere in this file, mirroring
 * src/adapters/jira/client.ts's "the capability doesn't exist in code"
 * pattern. Power Automate owns writes to this file; this adapter must
 * never modify it.
 *
 * Named client.ts (not renamed) to keep the same five-file adapter shape
 * every adapter in this codebase follows (config/client/mapper/errors/
 * index, per ARCHITECTURE.md §8) — its role is a local-fs reader now, not
 * an HTTP client, but the shape stays consistent.
 */
export class TeamAvailabilitySnapshotReader {
  private readonly readFileImpl: (path: string, encoding: "utf-8") => Promise<string>;

  constructor(options: TeamAvailabilitySnapshotReaderOptions = {}) {
    this.readFileImpl = options.readFileImpl ?? ((path, encoding) => readFile(path, encoding));
  }

  async readSnapshot(snapshotPath: string): Promise<Snapshot> {
    let text: string;
    try {
      text = await this.readFileImpl(snapshotPath, "utf-8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new TeamAvailabilitySnapshotNotFoundError(snapshotPath);
      }
      throw new TeamAvailabilitySnapshotReadFailedError(
        snapshotPath,
        error instanceof Error ? error.message : String(error),
      );
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (error) {
      throw new TeamAvailabilitySnapshotInvalidError(
        `not valid JSON (${error instanceof Error ? error.message : String(error)})`,
      );
    }

    const parsed = SnapshotSchema.safeParse(json);
    if (!parsed.success) {
      throw new TeamAvailabilitySnapshotInvalidError(parsed.error.message);
    }

    return parsed.data;
  }
}
