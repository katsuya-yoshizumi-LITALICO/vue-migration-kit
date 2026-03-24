import type { Plugin, Connect } from "vite";
import type { IncomingMessage } from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { runScan } from "./scanner.js";
import type { ScanReport, ScanResponse, ScanErrorResponse } from "./types.js";
import { generateExcel } from "./exportExcel.js";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

interface ExtractResult {
  scanDir: string;
  dirName: string;
}

function extractZipToTempDir(zipBuffer: Buffer): ExtractResult {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vue-scan-zip-"));
  const zipPath = path.join(tmpDir, "upload.zip");
  fs.writeFileSync(zipPath, zipBuffer);
  execSync(`unzip -o -q "${zipPath}" -d "${tmpDir}"`);
  fs.unlinkSync(zipPath);

  const entries = fs.readdirSync(tmpDir);
  if (
    entries.length === 1 &&
    fs.statSync(path.join(tmpDir, entries[0]!)).isDirectory()
  ) {
    return { scanDir: path.join(tmpDir, entries[0]!), dirName: entries[0]! };
  }
  return { scanDir: tmpDir, dirName: path.basename(tmpDir) };
}

function cleanupTempDir(dir: string): void {
  // Walk up to the mkdtemp root
  const marker = "vue-scan-";
  const idx = dir.indexOf(marker);
  const root =
    idx >= 0
      ? dir.substring(0, dir.indexOf(path.sep, idx + marker.length) >>> 0 || dir.length)
      : dir;
  try {
    fs.rmSync(root, { recursive: true, force: true });
  } catch {
    // best effort
  }
}

function respondJson(
  res: import("node:http").ServerResponse,
  status: number,
  data: ScanResponse | ScanErrorResponse,
): void {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

interface UploadedFile {
  path: string;
  content: string;
}

function writeFilesToTempDir(files: UploadedFile[]): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vue-scan-dir-"));
  for (const file of files) {
    const filePath = path.join(tmpDir, file.path);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, file.content, "utf-8");
  }
  return tmpDir;
}

export function createScannerApiPlugin(): Plugin {
  return {
    name: "vue-migration-scanner-api",
    configureServer(server) {
      // POST /api/scan-files — JSON body with files array from directory picker
      const filesHandler: Connect.NextHandleFunction = (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        void readBody(req).then((body) => {
          let tmpDir: string | undefined;
          try {
            const parsed = JSON.parse(body) as { files: UploadedFile[]; dirName?: string };

            if (!parsed.files || parsed.files.length === 0) {
              respondJson(res, 400, {
                ok: false,
                error: "No files provided",
              });
              return;
            }

            tmpDir = writeFilesToTempDir(parsed.files);
            const report = runScan({ targetDir: tmpDir });
            report.targetDir = parsed.dirName ?? "uploaded-directory";
            respondJson(res, 200, { ok: true, report });
          } catch (e) {
            respondJson(res, 500, {
              ok: false,
              error: e instanceof Error ? e.message : "Unknown error",
            });
          } finally {
            if (tmpDir) cleanupTempDir(tmpDir);
          }
        });
      };

      // POST /api/scan-zip — raw ZIP binary body
      const zipHandler: Connect.NextHandleFunction = (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        void readRawBody(req).then((buffer) => {
          let extractedDir: string | undefined;
          try {
            const { scanDir, dirName } = extractZipToTempDir(buffer);
            extractedDir = scanDir;
            const report = runScan({ targetDir: scanDir });
            report.targetDir = dirName;
            respondJson(res, 200, { ok: true, report });
          } catch (e) {
            respondJson(res, 500, {
              ok: false,
              error: e instanceof Error ? e.message : "Unknown error",
            });
          } finally {
            if (extractedDir) cleanupTempDir(extractedDir);
          }
        });
      };

      // POST /api/export-excel — JSON body with ScanReport, returns xlsx binary
      const exportHandler: Connect.NextHandleFunction = (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        void readBody(req).then((body) => {
          void (async () => {
            try {
              const report = JSON.parse(body) as ScanReport;
              const buffer = await generateExcel(report);

              res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              );
              res.setHeader(
                "Content-Disposition",
                "attachment; filename=vue-migration-report.xlsx",
              );
              res.end(buffer);
            } catch (e) {
              respondJson(res, 500, {
                ok: false,
                error: e instanceof Error ? e.message : "Unknown error",
              });
            }
          })();
        });
      };

      server.middlewares.use("/api/export-excel", exportHandler);
      server.middlewares.use("/api/scan-files", filesHandler);
      server.middlewares.use("/api/scan-zip", zipHandler);
    },
  };
}
