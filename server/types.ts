export type Severity = "error" | "warning" | "info";

export interface ScanHit {
  ruleId: string;
  category: string;
  severity: Severity;
  label: string;
  desc: string;
  file: string;
  line: number;
  lineText: string;
  docs: string;
}

export interface RuleSummary {
  ruleId: string;
  category: string;
  severity: Severity;
  label: string;
  count: number;
  files: string[];
  docs: string;
}

export interface SeverityCount {
  error: number;
  warning: number;
  info: number;
}

export interface ScanReport {
  generatedAt: string;
  targetDir: string;
  durationMs: number;
  scannedFiles: number;
  totalHits: number;
  severity: SeverityCount;
  rulesSummary: RuleSummary[];
  hits: ScanHit[];
}

export interface ScanRequest {
  targetDir: string;
  extensions?: string[];
  excludeDirs?: string[];
}

export type ScanResponse = { ok: true; report: ScanReport };
export type ScanErrorResponse = { ok: false; error: string };
