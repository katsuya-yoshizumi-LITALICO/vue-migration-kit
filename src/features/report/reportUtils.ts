import type { ScanHit, RuleSummary, Severity, ScanReport } from "@/shared/types/index.js";

export function groupHitsByFile(hits: ScanHit[]): Map<string, ScanHit[]> {
  const map = new Map<string, ScanHit[]>();
  for (const hit of hits) {
    const group = map.get(hit.file);
    if (group) {
      group.push(hit);
    } else {
      map.set(hit.file, [hit]);
    }
  }
  return map;
}

export function groupRulesByCategory(
  rules: RuleSummary[],
): Map<string, RuleSummary[]> {
  const map = new Map<string, RuleSummary[]>();
  for (const rule of rules) {
    const group = map.get(rule.category);
    if (group) {
      group.push(rule);
    } else {
      map.set(rule.category, [rule]);
    }
  }
  return map;
}

export function filterHitsBySeverity(
  hits: ScanHit[],
  severity: Severity | "all",
): ScanHit[] {
  if (severity === "all") return [...hits];
  return hits.filter((h) => h.severity === severity);
}

export function getTopRules(report: ScanReport, n: number): RuleSummary[] {
  return [...report.rulesSummary]
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const severityOrder: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

export function sortHitsBySeverity(hits: ScanHit[]): ScanHit[] {
  return [...hits].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );
}
