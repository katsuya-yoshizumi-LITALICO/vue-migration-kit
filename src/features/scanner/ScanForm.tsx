import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ScanReport } from "@/shared/types/index";
import type { ScanStatus, ScanProgress } from "./useScan";
import { fetchTargets, type UploadedFile } from "@/shared/utils/api";

interface ScanFormProps {
  status: ScanStatus;
  hasReports: boolean;
  progress: ScanProgress | null;
  onScanDirectory: (files: UploadedFile[], dirName: string) => Promise<void>;
  onScanMultiple: (
    dirs: { files: UploadedFile[]; dirName: string }[],
  ) => Promise<void>;
  onScanZip: (file: File) => Promise<void>;
  onScanFromTargets: (targets: string[]) => Promise<void>;
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
  return (
    SCAN_EXTENSIONS.has(
      "." + relativePath.split(".").slice(1).join("."),
    ) || SCAN_EXTENSIONS.has("." + (relativePath.split(".").pop() ?? ""))
  );
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

interface QueuedDir {
  files: UploadedFile[];
  dirName: string;
}

export function ScanForm({
  status,
  hasReports,
  progress,
  onScanDirectory,
  onScanMultiple,
  onScanZip,
  onScanFromTargets,
  onLoadReport,
  onReset,
  errorMessage,
}: ScanFormProps) {
  const zipInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueuedDir[]>([]);

  const isScanning = status === "scanning";

  async function handleAddFolder(): Promise<void> {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: "read" });
      const files = await readDirectoryHandle(dirHandle);
      if (files.length > 0) {
        setQueue((prev) => [...prev, { files, dirName: dirHandle.name }]);
      }
    } catch {
      // user cancelled
    }
  }

  function handleRemoveFromQueue(index: number): void {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }

  function handleStartScan(): void {
    if (queue.length === 0) return;
    const dirs = [...queue];
    setQueue([]);
    if (dirs.length === 1) {
      void onScanDirectory(dirs[0].files, dirs[0].dirName);
    } else {
      void onScanMultiple(dirs);
    }
  }

  async function handleScanTargets(): Promise<void> {
    try {
      const targets = await fetchTargets();
      if (targets.length === 0) return;
      void onScanFromTargets(targets);
    } catch (e) {
      // fetchTargets failed
      void e;
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
        onLoadReport(JSON.parse(text) as ScanReport);
      });
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Button
          onClick={() => void handleAddFolder()}
          disabled={isScanning}
          className="flex-1"
        >
          {isScanning && progress ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {progress.total > 1
                ? `${String(progress.current)}/${String(progress.total)} ${progress.dirName}`
                : progress.dirName}
            </span>
          ) : (
            "フォルダを選択"
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={() => zipInputRef.current?.click()}
          disabled={isScanning}
        >
          ZIP
        </Button>
        <Button
          variant="outline"
          onClick={() => jsonInputRef.current?.click()}
          disabled={isScanning}
        >
          レポート読込
        </Button>
        <Button
          variant="outline"
          onClick={() => void handleScanTargets()}
          disabled={isScanning}
        >
          targets.json
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

      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {queue.map((dir, i) => (
              <span
                key={`${dir.dirName}-${String(i)}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm"
              >
                {dir.dirName}
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveFromQueue(i)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <Button onClick={handleStartScan} className="w-full">
            スキャン開始（{String(queue.length)}件）
          </Button>
        </div>
      )}

      {hasReports && (
        <Button variant="secondary" onClick={onReset} size="sm">
          すべてリセット
        </Button>
      )}
      {status === "error" && errorMessage && (
        <pre className="whitespace-pre-wrap text-sm text-severity-error">
          {errorMessage}
        </pre>
      )}
    </div>
  );
}
