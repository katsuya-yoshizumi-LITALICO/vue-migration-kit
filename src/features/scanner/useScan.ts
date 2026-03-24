import { useState } from "react";
import type { ScanReport } from "@/shared/types/index";
import {
  scanFiles,
  scanZipFile,
  scanTargets,
  type UploadedFile,
} from "@/shared/utils/api";

export type ScanStatus = "idle" | "scanning" | "done" | "error";

export interface ScanProgress {
  current: number;
  total: number;
  dirName: string;
}

export interface UseScanReturn {
  status: ScanStatus;
  reports: ScanReport[];
  currentIndex: number;
  errorMessage: string | null;
  progress: ScanProgress | null;
  scanDirectory: (files: UploadedFile[], dirName: string) => Promise<void>;
  scanMultipleDirectories: (
    dirs: { files: UploadedFile[]; dirName: string }[],
  ) => Promise<void>;
  scanZip: (file: File) => Promise<void>;
  scanFromTargets: (targets: string[]) => Promise<void>;
  loadReport: (report: ScanReport) => void;
  setCurrentIndex: (index: number) => void;
  removeReport: (index: number) => void;
  reset: () => void;
}

export function useScan(): UseScanReturn {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [reports, setReports] = useState<ScanReport[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<ScanProgress | null>(null);

  async function scanDirectory(
    files: UploadedFile[],
    dirName: string,
  ): Promise<void> {
    setStatus("scanning");
    setErrorMessage(null);
    setProgress({ current: 1, total: 1, dirName });

    try {
      const result = await scanFiles(files, dirName);
      setReports((prev) => [...prev, result]);
      setCurrentIndex((prev) => (prev === 0 && reports.length === 0 ? 0 : reports.length));
      setStatus("done");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    } finally {
      setProgress(null);
    }
  }

  async function scanMultipleDirectories(
    dirs: { files: UploadedFile[]; dirName: string }[],
  ): Promise<void> {
    setStatus("scanning");
    setErrorMessage(null);

    const newReports: ScanReport[] = [];
    const errors: string[] = [];

    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      setProgress({ current: i + 1, total: dirs.length, dirName: dir.dirName });

      try {
        const result = await scanFiles(dir.files, dir.dirName);
        newReports.push(result);
      } catch (e) {
        errors.push(
          `${dir.dirName}: ${e instanceof Error ? e.message : "Unknown error"}`,
        );
      }
    }

    setProgress(null);

    if (newReports.length > 0) {
      setReports((prev) => {
        setCurrentIndex(prev.length);
        return [...prev, ...newReports];
      });
      setStatus("done");
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join("\n"));
      if (newReports.length === 0) {
        setStatus("error");
      }
    }
  }

  async function scanZip(file: File): Promise<void> {
    setStatus("scanning");
    setErrorMessage(null);
    setProgress({ current: 1, total: 1, dirName: file.name });

    try {
      const result = await scanZipFile(file);
      setReports((prev) => [...prev, result]);
      setCurrentIndex((prev) => (prev === 0 && reports.length === 0 ? 0 : reports.length));
      setStatus("done");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    } finally {
      setProgress(null);
    }
  }

  async function scanFromTargets(targets: string[]): Promise<void> {
    setStatus("scanning");
    setErrorMessage(null);
    setProgress({ current: 1, total: targets.length, dirName: "targets.json" });

    try {
      const { reports: newReports, errors } = await scanTargets(targets);

      if (newReports.length > 0) {
        setReports((prev) => {
          setCurrentIndex(prev.length);
          return [...prev, ...newReports];
        });
        setStatus("done");
      }

      if (errors.length > 0) {
        setErrorMessage(errors.join("\n"));
        if (newReports.length === 0) {
          setStatus("error");
        }
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    } finally {
      setProgress(null);
    }
  }

  function loadReport(loaded: ScanReport): void {
    setReports((prev) => [...prev, loaded]);
    setCurrentIndex((prev) => (prev === 0 && reports.length === 0 ? 0 : reports.length));
    setStatus("done");
    setErrorMessage(null);
  }

  function removeReport(index: number): void {
    setReports((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setStatus("idle");
        setCurrentIndex(0);
      } else {
        setCurrentIndex(Math.min(index, next.length - 1));
      }
      return next;
    });
  }

  function reset(): void {
    setStatus("idle");
    setReports([]);
    setCurrentIndex(0);
    setErrorMessage(null);
    setProgress(null);
  }

  return {
    status,
    reports,
    currentIndex,
    errorMessage,
    progress,
    scanDirectory,
    scanMultipleDirectories,
    scanZip,
    scanFromTargets,
    loadReport,
    setCurrentIndex,
    removeReport,
    reset,
  };
}
