import ExcelJS from "exceljs";
import type { ScanReport } from "./types";

const severityFill: Record<string, Partial<ExcelJS.Fill>> = {
  error: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFCE4E4" },
  },
  warning: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFF4E4" },
  },
  info: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE4F4FF" },
  },
};

const headerFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1F2937" },
};

const headerFont: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
};

function styleHeader(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: "middle" };
  });
}

export async function generateExcel(report: ScanReport): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();

  // ── サマリーシート ──
  const summary = wb.addWorksheet("サマリー");
  summary.columns = [{ width: 24 }, { width: 50 }];

  const titleRow = summary.addRow(["レポート"]);
  titleRow.font = { bold: true, size: 14 };
  summary.mergeCells("A1:B1");

  summary.addRow([]);
  const sh = summary.addRow(["項目", "値"]);
  styleHeader(sh);

  const items: [string, string | number][] = [
    ["スキャン日時", report.generatedAt],
    ["対象ディレクトリ", report.targetDir],
    ["スキャンファイル数", report.scannedFiles],
    ["検出合計", report.totalHits],
    ["Error", report.severity.error],
    ["Warning", report.severity.warning],
    ["Info", report.severity.info],
  ];
  for (const [k, v] of items) {
    summary.addRow([k, v]);
  }

  // severity 凡例
  summary.addRow([]);
  summary.addRow([]);
  const legendHeader = summary.addRow(["重要度", "意味", "移行への影響"]);
  styleHeader(legendHeader);
  summary.getColumn(3).width = 60;

  const legends: [string, string, string][] = [
    [
      "Error",
      "Vue 3 / Nuxt 3 で廃止された API",
      "移行時に必ず修正が必要。そのままではビルドエラーまたは実行時エラーになる",
    ],
    [
      "Warning",
      "非推奨または大幅に変更された API",
      "動作する場合もあるが、将来のバージョンで削除される可能性が高い。移行時に対応を推奨",
    ],
    [
      "Info",
      "設定やパターンの変更が必要な箇所",
      "動作に直接影響しないが、Nuxt 3 の新しい方式に書き換えることで保守性が向上する",
    ],
  ];
  for (const [sev, meaning, impact] of legends) {
    const row = summary.addRow([sev, meaning, impact]);
    const fill = severityFill[sev.toLowerCase()];
    if (fill) {
      row.getCell(1).fill = fill as ExcelJS.Fill;
    }
    row.getCell(3).alignment = { wrapText: true, vertical: "top" };
  }

  // ── ルール別シート ──
  const rules = wb.addWorksheet("ルール別");
  rules.columns = [
    { header: "ルールID", key: "ruleId", width: 22 },
    { header: "カテゴリ", key: "category", width: 18 },
    { header: "重要度", key: "severity", width: 10 },
    { header: "ラベル", key: "label", width: 24 },
    { header: "検出数", key: "count", width: 10 },
    { header: "ファイル数", key: "fileCount", width: 10 },
    { header: "対象ファイル", key: "files", width: 80 },
    { header: "ドキュメント", key: "docs", width: 50 },
  ];
  styleHeader(rules.getRow(1));

  for (const r of report.rulesSummary) {
    const row = rules.addRow({
      ruleId: r.ruleId,
      category: r.category,
      severity: r.severity,
      label: r.label,
      count: r.count,
      fileCount: r.files.length,
      files: r.files.join("\n"),
      docs: r.docs,
    });

    const fill = severityFill[r.severity];
    if (fill) {
      row.getCell("severity").fill = fill as ExcelJS.Fill;
    }
    row.getCell("files").alignment = { wrapText: true, vertical: "top" };
  }

  rules.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: report.rulesSummary.length + 1, column: 8 },
  };

  // ── 検出一覧シート ──
  const hits = wb.addWorksheet("検出一覧");
  hits.columns = [
    { header: "ファイル", key: "file", width: 40 },
    { header: "行", key: "line", width: 6 },
    { header: "重要度", key: "severity", width: 10 },
    { header: "ルールID", key: "ruleId", width: 22 },
    { header: "ラベル", key: "label", width: 24 },
    { header: "説明", key: "desc", width: 30 },
    { header: "コード", key: "lineText", width: 60 },
    { header: "ドキュメント", key: "docs", width: 50 },
  ];
  styleHeader(hits.getRow(1));

  for (const h of report.hits) {
    const row = hits.addRow({
      file: h.file,
      line: h.line,
      severity: h.severity,
      ruleId: h.ruleId,
      label: h.label,
      desc: h.desc,
      lineText: h.lineText,
      docs: h.docs,
    });

    const fill = severityFill[h.severity];
    if (fill) {
      row.getCell("severity").fill = fill as ExcelJS.Fill;
    }
  }

  hits.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: report.hits.length + 1, column: 8 },
  };

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
