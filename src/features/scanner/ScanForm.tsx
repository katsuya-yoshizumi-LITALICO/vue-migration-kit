import { useRef } from "react";
import { Button } from "@/components/ui/button";
import type { ScanReport } from "@/shared/types/index.js";
import type { ScanStatus } from "./useScan.js";
import type { UploadedFile } from "@/shared/utils/api.js";

interface ScanFormProps {
  status: ScanStatus;
  onScanDirectory: (files: UploadedFile[], dirName: string) => Promise<void>;
  onScanZip: (file: File) => Promise<void>;
  onLoadReport: (report: ScanReport) => void;
  onReset: () => void;
  errorMessage: string | null;
}

const SCAN_EXTENSIONS = new Set([
  ".vue",
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".nuxt.config.js",
  ".nuxt.config.ts",
]);

const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".nuxt",
  "dist",
  ".git",
  ".next",
]);

function shouldInclude(relativePath: string): boolean {
  const parts = relativePath.split("/");
  if (parts.some((p) => EXCLUDE_DIRS.has(p))) return false;
  return SCAN_EXTENSIONS.has(
    "." + relativePath.split(".").slice(1).join("."),
  ) || SCAN_EXTENSIONS.has("." + (relativePath.split(".").pop() ?? ""));
}

async function readDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle,
  basePath = "",
): Promise<UploadedFile[]> {
  const files: UploadedFile[] = [];

  for await (const entry of dirHandle.values()) {
    const entryPath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.kind === "directory") {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      const subFiles = await readDirectoryHandle(entry, entryPath);
      files.push(...subFiles);
    } else if (entry.kind === "file" && shouldInclude(entryPath)) {
      const file = await entry.getFile();
      const content = await file.text();
      files.push({ path: entryPath, content });
    }
  }

  return files;
}

export function ScanForm({
  status,
  onScanDirectory,
  onScanZip,
  onLoadReport,
  onReset,
  errorMessage,
}: ScanFormProps) {
  const zipInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const isScanning = status === "scanning";
  const isDone = status === "done" || status === "error";

  async function handlePickDirectory(): Promise<void> {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: "read" });
      const files = await readDirectoryHandle(dirHandle);
      if (files.length === 0) {
        return;
      }
      void onScanDirectory(files, dirHandle.name);
    } catch {
      // user cancelled
    }
  }

  function handleZipChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file) {
      void onScanZip(file);
    }
    e.target.value = "";
  }

  function handleJsonChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file) {
      void file.text().then((text) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        onLoadReport(JSON.parse(text) as ScanReport);
      });
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      {!isDone && (
        <div className="flex gap-3">
          <Button
            onClick={() => void handlePickDirectory()}
            disabled={isScanning}
            className="flex-1"
          >
            {isScanning ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "フォルダを選択"
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => zipInputRef.current?.click()}
            disabled={isScanning}
            className="flex-1"
          >
            ZIP ファイルを選択
          </Button>
          <Button
            variant="outline"
            onClick={() => jsonInputRef.current?.click()}
            disabled={isScanning}
            className="flex-1"
          >
            レポートを読み込み
          </Button>
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleZipChange}
          />
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleJsonChange}
          />
        </div>
      )}
      {isDone && (
        <Button variant="secondary" onClick={onReset} className="w-full">
          リセット
        </Button>
      )}
      {status === "error" && errorMessage && (
        <p className="text-sm text-severity-error">{errorMessage}</p>
      )}
    </div>
  );
}
