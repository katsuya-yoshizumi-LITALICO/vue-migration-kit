import fs from "node:fs";
import path from "node:path";
import { rules } from "./rules.js";
import type {
  ScanHit,
  ScanReport,
  RuleSummary,
  SeverityCount,
} from "./types.js";

export interface SfcParts {
  template: string;
  script: string;
  full: string;
}

const DEFAULT_EXTENSIONS = [".vue", ".js", ".ts", ".nuxt.config.js", ".nuxt.config.ts"];
const DEFAULT_EXCLUDE_DIRS = ["node_modules", ".nuxt", "dist", ".git"];

function parseSubmodulePaths(rootDir: string): Set<string> {
  const gitmodulesPath = path.join(rootDir, ".gitmodules");
  if (!fs.existsSync(gitmodulesPath)) return new Set();

  const content = fs.readFileSync(gitmodulesPath, "utf-8");
  const paths = new Set<string>();
  const re = /^\s*path\s*=\s*(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const p = match[1]?.trim();
    if (p) paths.add(p);
  }
  return paths;
}

export function walkFiles(
  dir: string,
  extensions: string[],
  excludeDirs: string[],
): string[] {
  if (!fs.existsSync(dir)) return [];

  const submodulePaths = parseSubmodulePaths(dir);
  const results: string[] = [];

  function walk(currentDir: string): void {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (excludeDirs.includes(entry.name)) continue;
        const rel = path.relative(dir, fullPath);
        if (submodulePaths.has(rel)) continue;
        walk(fullPath);
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

export function extractSfcParts(content: string, isVue: boolean): SfcParts {
  if (!isVue) {
    return { template: content, script: content, full: content };
  }

  let template = "";
  let script = "";

  const templateMatch = /<template[^>]*>([\s\S]*?)<\/template>/gmu.exec(
    content,
  );
  if (templateMatch) {
    template = templateMatch[1] ?? "";
  }

  const scriptMatch = /<script[^>]*>([\s\S]*?)<\/script>/gmu.exec(content);
  if (scriptMatch) {
    script = scriptMatch[1] ?? "";
  }

  return { template, script, full: content };
}

export function findHitsInContent(
  content: string,
  sfc: SfcParts,
  relPath: string,
): ScanHit[] {
  const hits: ScanHit[] = [];

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      const target = pattern.templateOnly ? sfc.template : sfc.full;
      const regex = new RegExp(pattern.re.source, pattern.re.flags);

      let match: RegExpExecArray | null;
      while ((match = regex.exec(target)) !== null) {
        const beforeMatch = target.substring(0, match.index);
        const line = beforeMatch.split("\n").length;
        const lines = content.split("\n");
        const lineText = lines[line - 1]?.trim() ?? "";

        hits.push({
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity,
          label: rule.label,
          desc: pattern.desc,
          file: relPath,
          line,
          lineText,
          docs: rule.docs,
        });
      }
    }
  }

  return hits;
}

export function buildRulesSummary(hits: ScanHit[]): RuleSummary[] {
  const map = new Map<
    string,
    { hit: ScanHit; count: number; files: Set<string> }
  >();

  for (const hit of hits) {
    const existing = map.get(hit.ruleId);
    if (existing) {
      existing.count++;
      existing.files.add(hit.file);
    } else {
      map.set(hit.ruleId, {
        hit,
        count: 1,
        files: new Set([hit.file]),
      });
    }
  }

  return [...map.values()]
    .map((entry) => ({
      ruleId: entry.hit.ruleId,
      category: entry.hit.category,
      severity: entry.hit.severity,
      label: entry.hit.label,
      count: entry.count,
      files: [...entry.files],
      docs: entry.hit.docs,
    }))
    .sort((a, b) => b.count - a.count);
}

export function countBySeverity(hits: ScanHit[]): SeverityCount {
  const counts: SeverityCount = { error: 0, warning: 0, info: 0 };
  for (const hit of hits) {
    counts[hit.severity]++;
  }
  return counts;
}

export function runScan(options: {
  targetDir: string;
  extensions?: string[];
  excludeDirs?: string[];
}): ScanReport {
  const start = performance.now();
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;
  const excludeDirs = options.excludeDirs ?? DEFAULT_EXCLUDE_DIRS;

  const files = walkFiles(options.targetDir, extensions, excludeDirs);
  const allHits: ScanHit[] = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf-8");
    const isVue = filePath.endsWith(".vue");
    const sfc = extractSfcParts(content, isVue);
    const relPath = path.relative(options.targetDir, filePath);
    const hits = findHitsInContent(content, sfc, relPath);
    allHits.push(...hits);
  }

  const durationMs = Math.round(performance.now() - start);

  return {
    generatedAt: new Date().toISOString(),
    targetDir: options.targetDir,
    durationMs,
    scannedFiles: files.length,
    totalHits: allHits.length,
    severity: countBySeverity(allHits),
    rulesSummary: buildRulesSummary(allHits),
    hits: allHits,
  };
}
