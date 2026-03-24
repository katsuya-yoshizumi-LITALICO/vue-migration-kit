import { describe, it, expect } from "vitest";
import type { ScanHit, ScanReport, RuleSummary } from "@/shared/types/index.js";
import {
  groupHitsByFile,
  filterHitsBySeverity,
  getTopRules,
  formatDuration,
  sortHitsBySeverity,
} from "./reportUtils.js";

function createHit(
  overrides: Partial<ScanHit> = {},
): ScanHit {
  return {
    ruleId: "test",
    category: "test",
    severity: "error",
    label: "test",
    desc: "test",
    file: "test.vue",
    line: 1,
    lineText: "test",
    docs: "https://example.com",
    ...overrides,
  };
}

function createReport(
  rulesSummary: RuleSummary[],
): ScanReport {
  return {
    generatedAt: new Date().toISOString(),
    targetDir: "/tmp",
    durationMs: 100,
    scannedFiles: 10,
    totalHits: 0,
    severity: { error: 0, warning: 0, info: 0 },
    rulesSummary,
    hits: [],
  };
}

describe("groupHitsByFile", () => {
  it("ファイル別にグループ化する", () => {
    const hits = [
      createHit({ file: "a.vue" }),
      createHit({ file: "b.vue" }),
      createHit({ file: "a.vue" }),
    ];

    const grouped = groupHitsByFile(hits);
    expect(grouped.get("a.vue")).toHaveLength(2);
    expect(grouped.get("b.vue")).toHaveLength(1);
  });

  it("挿入順を保持する", () => {
    const hits = [
      createHit({ file: "b.vue" }),
      createHit({ file: "a.vue" }),
      createHit({ file: "c.vue" }),
    ];

    const grouped = groupHitsByFile(hits);
    const keys = [...grouped.keys()];
    expect(keys).toEqual(["b.vue", "a.vue", "c.vue"]);
  });
});

describe("filterHitsBySeverity", () => {
  const hits = [
    createHit({ severity: "error" }),
    createHit({ severity: "warning" }),
    createHit({ severity: "info" }),
    createHit({ severity: "error" }),
  ];

  it("all ですべて返す", () => {
    expect(filterHitsBySeverity(hits, "all")).toHaveLength(4);
  });

  it("error のみフィルタ", () => {
    expect(filterHitsBySeverity(hits, "error")).toHaveLength(2);
  });

  it("warning のみフィルタ", () => {
    expect(filterHitsBySeverity(hits, "warning")).toHaveLength(1);
  });

  it("info のみフィルタ", () => {
    expect(filterHitsBySeverity(hits, "info")).toHaveLength(1);
  });

  it("元配列を変更しない", () => {
    const original = [...hits];
    filterHitsBySeverity(hits, "error");
    expect(hits).toEqual(original);
  });
});

describe("getTopRules", () => {
  it("count 降順で上位 N 件を返す", () => {
    const rules: RuleSummary[] = [
      { ruleId: "a", category: "c", severity: "error", label: "a", count: 5, files: [], docs: "" },
      { ruleId: "b", category: "c", severity: "warning", label: "b", count: 10, files: [], docs: "" },
      { ruleId: "c", category: "c", severity: "info", label: "c", count: 1, files: [], docs: "" },
    ];
    const report = createReport(rules);

    const top = getTopRules(report, 2);
    expect(top).toHaveLength(2);
    expect(top[0]?.ruleId).toBe("b");
    expect(top[1]?.ruleId).toBe("a");
  });

  it("元配列を変更しない", () => {
    const rules: RuleSummary[] = [
      { ruleId: "a", category: "c", severity: "error", label: "a", count: 5, files: [], docs: "" },
      { ruleId: "b", category: "c", severity: "warning", label: "b", count: 10, files: [], docs: "" },
    ];
    const report = createReport(rules);
    const original = [...report.rulesSummary];

    getTopRules(report, 1);
    expect(report.rulesSummary).toEqual(original);
  });
});

describe("formatDuration", () => {
  it("42ms を返す", () => {
    expect(formatDuration(42)).toBe("42ms");
  });

  it("2500ms を 2.5s に変換", () => {
    expect(formatDuration(2500)).toBe("2.5s");
  });

  it("999ms は ms 表記", () => {
    expect(formatDuration(999)).toBe("999ms");
  });

  it("1000ms は 1.0s", () => {
    expect(formatDuration(1000)).toBe("1.0s");
  });
});

describe("sortHitsBySeverity", () => {
  it("error > warning > info 順にソート", () => {
    const hits = [
      createHit({ severity: "info" }),
      createHit({ severity: "error" }),
      createHit({ severity: "warning" }),
    ];

    const sorted = sortHitsBySeverity(hits);
    expect(sorted[0]?.severity).toBe("error");
    expect(sorted[1]?.severity).toBe("warning");
    expect(sorted[2]?.severity).toBe("info");
  });

  it("元配列を変更しない", () => {
    const hits = [
      createHit({ severity: "info" }),
      createHit({ severity: "error" }),
    ];
    const original = [...hits];

    sortHitsBySeverity(hits);
    expect(hits).toEqual(original);
  });
});
