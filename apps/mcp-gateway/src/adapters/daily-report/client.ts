import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DailyReportInvalidError, DailyReportNotFoundError, DailyReportWriteFailedError } from "./errors.js";
import { DailyReportSchema, type DailyReport } from "./mapper.js";

export interface DailyReportStoreOptions {
  /** Injected for tests — reads/writes real files by default. */
  readFileImpl?: (path: string, encoding: "utf-8") => Promise<string>;
  writeFileImpl?: (path: string, data: string, encoding: "utf-8") => Promise<void>;
  mkdirImpl?: (path: string, options: { recursive: true }) => Promise<string | undefined>;
}

function filePathFor(storeDir: string, date: string): string {
  return path.join(storeDir, `${date}.json`);
}

/**
 * Local per-day JSON file store. Unlike team-availability's client.ts, this
 * one legitimately owns writes — the gateway itself is the sole producer of
 * these files (no external process writes them), so a write() method here
 * doesn't violate the "adapters never write to systems they don't own"
 * precedent set by Jira/Team Availability (both of which are read-only
 * against systems owned by someone else).
 *
 * Named client.ts to keep the same five-file adapter shape every adapter in
 * this codebase follows (config/client/mapper/errors/index, per
 * ARCHITECTURE.md §8).
 */
export class DailyReportStore {
  private readonly readFileImpl: (path: string, encoding: "utf-8") => Promise<string>;
  private readonly writeFileImpl: (path: string, data: string, encoding: "utf-8") => Promise<void>;
  private readonly mkdirImpl: (path: string, options: { recursive: true }) => Promise<string | undefined>;

  constructor(options: DailyReportStoreOptions = {}) {
    this.readFileImpl = options.readFileImpl ?? ((p, encoding) => readFile(p, encoding));
    this.writeFileImpl = options.writeFileImpl ?? ((p, data, encoding) => writeFile(p, data, encoding));
    this.mkdirImpl = options.mkdirImpl ?? ((p, opts) => mkdir(p, opts));
  }

  async write(storeDir: string, report: DailyReport): Promise<void> {
    const filePath = filePathFor(storeDir, report.date);
    try {
      await this.mkdirImpl(storeDir, { recursive: true });
      await this.writeFileImpl(filePath, JSON.stringify(report, null, 2), "utf-8");
    } catch (error) {
      throw new DailyReportWriteFailedError(filePath, error instanceof Error ? error.message : String(error));
    }
  }

  async read(storeDir: string, date: string): Promise<DailyReport> {
    const filePath = filePathFor(storeDir, date);
    let text: string;
    try {
      text = await this.readFileImpl(filePath, "utf-8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new DailyReportNotFoundError(date, filePath);
      }
      throw new DailyReportInvalidError(date, error instanceof Error ? error.message : String(error));
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (error) {
      throw new DailyReportInvalidError(
        date,
        `not valid JSON (${error instanceof Error ? error.message : String(error)})`,
      );
    }

    const parsed = DailyReportSchema.safeParse(json);
    if (!parsed.success) {
      throw new DailyReportInvalidError(date, parsed.error.message);
    }

    return parsed.data as DailyReport;
  }
}
