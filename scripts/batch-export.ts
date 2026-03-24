import fs from "node:fs";
import path from "node:path";
import { runScan } from "../server/scanner";
import { generateExcel } from "../server/exportExcel";

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const TARGETS_PATH = path.join(ROOT_DIR, "targets.json");
const EXPORTS_DIR = path.join(ROOT_DIR, "exports");
const PARENT_DIR = path.resolve(ROOT_DIR, "..");

async function main(): Promise<void> {
  if (!fs.existsSync(TARGETS_PATH)) {
    console.error("targets.json が見つかりません:", TARGETS_PATH);
    process.exit(1);
  }

  const targets = JSON.parse(
    fs.readFileSync(TARGETS_PATH, "utf-8"),
  ) as string[];

  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }

  console.log(`対象: ${String(targets.length)} プロジェクト\n`);

  let success = 0;
  let skipped = 0;

  for (const name of targets) {
    const targetDir = path.join(PARENT_DIR, name);

    if (!fs.existsSync(targetDir)) {
      console.log(`[SKIP] ${name} — ディレクトリが存在しません: ${targetDir}`);
      skipped++;
      continue;
    }

    console.log(`[SCAN] ${name} ...`);
    try {
      const report = runScan({ targetDir });
      report.targetDir = name;

      const buffer = await generateExcel(report);
      const outPath = path.join(EXPORTS_DIR, `${name}.xlsx`);
      fs.writeFileSync(outPath, buffer);

      console.log(
        `  → ${String(report.totalHits)} hits (E:${String(report.severity.error)} W:${String(report.severity.warning)} I:${String(report.severity.info)}) — ${outPath}`,
      );
      success++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      console.log(`[ERROR] ${name} — ${msg}`);
      skipped++;
    }
  }

  console.log(
    `\n完了: ${String(success)} 成功, ${String(skipped)} スキップ`,
  );
}

void main();
