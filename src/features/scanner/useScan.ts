import { useState } from "react";
import type { ScanReport } from "@/shared/types/index.js";
import {
  scanFiles,
  scanZipFile,
  type UploadedFile,
} from "@/shared/utils/api.js";

export type ScanStatus = "idle" | "scanning" | "done" | "error";

export interface UseScanReturn {
  status: ScanStatus;
  report: ScanReport | null;
  errorMessage: string | null;
  scanDirectory: (files: UploadedFile[], dirName: string) => Promise<void>;
  scanZip: (file: File) => Promise<void>;
  loadReport: (report: ScanReport) => void;
  reset: () => void;
}

export function useScan(): UseScanReturn {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [report, setReport] = useState<ScanReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function scanDirectory(files: UploadedFile[], dirName: string): Promise<void> {
    setStatus("scanning");
    setErrorMessage(null);
    setReport(null);

    try {
      const result = await scanFiles(files, dirName);
      setReport(result);
      setStatus("done");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }

  async function scanZip(file: File): Promise<void> {
    setStatus("scanning");
    setErrorMessage(null);
    setReport(null);

    try {
      const result = await scanZipFile(file);
      setReport(result);
      setStatus("done");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }

  function loadReport(loaded: ScanReport): void {
    setReport(loaded);
    setStatus("done");
    setErrorMessage(null);
  }

  function reset(): void {
    setStatus("idle");
    setReport(null);
    setErrorMessage(null);
  }

  return { status, report, errorMessage, scanDirectory, scanZip, loadReport, reset };
}
