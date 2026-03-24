import type { Plugin, Connect } from "vite";
import type { IncomingMessage } from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { runScan } from "./scanner";
import type { ScanReport, ScanResponse, ScanErrorResponse } from "./types";
import { generateExcel } from "./exportExcel";

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

      // GET /api/targets — return targets.json content
      const targetsHandler: Connect.NextHandleFunction = (req, res, next) => {
        if (req.method !== "GET") {
          next();
          return;
        }

        const targetsPath = path.resolve(import.meta.dirname, "..", "targets.json");
        if (!fs.existsSync(targetsPath)) {
          respondJson(res, 404, { ok: false, error: "targets.json not found" });
          return;
        }

        try {
          const content = fs.readFileSync(targetsPath, "utf-8");
          const targets = JSON.parse(content) as string[];
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, targets }));
        } catch (e) {
          respondJson(res, 500, {
            ok: false,
            error: e instanceof Error ? e.message : "Unknown error",
          });
        }
      };

      // POST /api/scan-targets — scan directories listed in targets.json from parent dir
      const scanTargetsHandler: Connect.NextHandleFunction = (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        void readBody(req).then((body) => {
          try {
            const parsed = JSON.parse(body) as { targets: string[] };
            const parentDir = path.resolve(import.meta.dirname, "..", "..");
            const results: { name: string; report: ScanReport }[] = [];
            const errors: string[] = [];

            for (const name of parsed.targets) {
              const targetDir = path.join(parentDir, name);
              if (!fs.existsSync(targetDir)) {
                errors.push(`${name}: directory not found`);
                continue;
              }
              try {
                const report = runScan({ targetDir });
                report.targetDir = name;
                results.push({ name, report });
              } catch (e) {
                errors.push(
                  `${name}: ${e instanceof Error ? e.message : "Unknown error"}`,
                );
              }
            }

            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                ok: true,
                reports: results.map((r) => r.report),
                errors,
              }),
            );
          } catch (e) {
            respondJson(res, 500, {
              ok: false,
              error: e instanceof Error ? e.message : "Unknown error",
            });
          }
        });
      };

      // POST /api/export-to-exports — save reports as xlsx to exports/ directory
      const exportToExportsHandler: Connect.NextHandleFunction = (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        void readBody(req).then((body) => {
          void (async () => {
            try {
              const parsed = JSON.parse(body) as { reports: ScanReport[] };
              const exportsDir = path.resolve(import.meta.dirname, "..", "exports");
              if (!fs.existsSync(exportsDir)) {
                fs.mkdirSync(exportsDir, { recursive: true });
              }

              const saved: string[] = [];
              for (const report of parsed.reports) {
                const fileName = report.targetDir.replace(/[/\\:*?"<>|]/g, "_") + ".xlsx";
                const buffer = await generateExcel(report);
                fs.writeFileSync(path.join(exportsDir, fileName), buffer);
                saved.push(fileName);
              }

              res.setHeader("Content-Type", "application/json");
              res.statusCode = 200;
              res.end(JSON.stringify({ ok: true, saved }));
            } catch (e) {
              respondJson(res, 500, {
                ok: false,
                error: e instanceof Error ? e.message : "Unknown error",
              });
            }
          })();
        });
      };

      server.middlewares.use("/api/export-to-exports", exportToExportsHandler);
      server.middlewares.use("/api/targets", targetsHandler);
      server.middlewares.use("/api/scan-targets", scanTargetsHandler);
      server.middlewares.use("/api/export-excel", exportHandler);
      server.middlewares.use("/api/scan-files", filesHandler);
      server.middlewares.use("/api/scan-zip", zipHandler);
    },
  };
}
