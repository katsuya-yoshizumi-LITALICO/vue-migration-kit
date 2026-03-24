import { saveAs } from "file-saver";
import type { ScanReport } from "@/shared/types/index";

function buildFileName(report: ScanReport, ext: string): string {
  const dirName = report.targetDir.replace(/[/\\:*?"<>|]/g, "_");
  return `${dirName}.${ext}`;
}

export async function exportToExcel(report: ScanReport): Promise<void> {
  const res = await fetch("/api/export-excel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  });

  if (!res.ok) {
    throw new Error("Excel export failed");
  }

  const blob = await res.blob();
  saveAs(blob, buildFileName(report, "xlsx"));
}

export function exportToJson(report: ScanReport): void {
  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  saveAs(blob, buildFileName(report, "json"));
}
