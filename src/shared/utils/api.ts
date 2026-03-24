import type {
  ScanReport,
  ScanResponse,
  ScanErrorResponse,
} from "../types/index.js";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function assertOk(
  data: ScanResponse | ScanErrorResponse,
  status: number,
): asserts data is ScanResponse {
  if (!data.ok) {
    throw new ApiError(data.error, status);
  }
}

export interface UploadedFile {
  path: string;
  content: string;
}

export async function scanFiles(files: UploadedFile[], dirName: string): Promise<ScanReport> {
  const res = await fetch("/api/scan-files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files, dirName }),
  });

  const data = (await res.json()) as ScanResponse | ScanErrorResponse;
  assertOk(data, res.status);
  return data.report;
}

export async function scanZipFile(file: File): Promise<ScanReport> {
  const buffer = await file.arrayBuffer();

  const res = await fetch("/api/scan-zip", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: buffer,
  });

  const data = (await res.json()) as ScanResponse | ScanErrorResponse;
  assertOk(data, res.status);
  return data.report;
}
