import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  walkFiles,
  extractSfcParts,
  findHitsInContent,
  buildRulesSummary,
  countBySeverity,
} from "./scanner";

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "scanner-test-"));
}

function removeTmpDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe("walkFiles", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir();
  });

  afterEach(() => {
    removeTmpDir(tmpDir);
  });

  it("指定拡張子のファイルのみ返す", () => {
    fs.writeFileSync(path.join(tmpDir, "app.vue"), "");
    fs.writeFileSync(path.join(tmpDir, "style.css"), "");
    fs.writeFileSync(path.join(tmpDir, "utils.ts"), "");

    const result = walkFiles(tmpDir, [".vue", ".ts"], []);
    expect(result).toHaveLength(2);
    expect(result.some((f) => f.endsWith("app.vue"))).toBe(true);
    expect(result.some((f) => f.endsWith("utils.ts"))).toBe(true);
  });

  it("excludeDirs に含まれるディレクトリはスキップ", () => {
    const subDir = path.join(tmpDir, "node_modules");
    fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(subDir, "lib.vue"), "");
    fs.writeFileSync(path.join(tmpDir, "app.vue"), "");

    const result = walkFiles(tmpDir, [".vue"], ["node_modules"]);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("app.vue");
  });

  it("存在しないディレクトリで空配列を返す", () => {
    const result = walkFiles("/nonexistent/path", [".vue"], []);
    expect(result).toEqual([]);
  });
});

describe("extractSfcParts", () => {
  it(".vue で template/script を正しく分離する", () => {
    const content = `<template>
  <div>{{ msg }}</div>
</template>
<script>
export default { data() { return { msg: "hello" } } }
</script>`;

    const result = extractSfcParts(content, true);
    expect(result.template).toContain("{{ msg }}");
    expect(result.script).toContain("export default");
    expect(result.full).toBe(content);
  });

  it("非 Vue ファイルでは full=template=script=全文", () => {
    const content = 'const x = "hello";';
    const result = extractSfcParts(content, false);
    expect(result.template).toBe(content);
    expect(result.script).toBe(content);
    expect(result.full).toBe(content);
  });
});

describe("findHitsInContent", () => {
  it("filters: を含むコードで filters ルールを検出", () => {
    const content = `export default {
  filters: {
    capitalize(val) { return val.toUpperCase(); }
  }
}`;
    const sfc = extractSfcParts(content, false);
    const hits = findHitsInContent(content, sfc, "test.vue");
    expect(hits.some((h) => h.ruleId === "filters")).toBe(true);
  });

  it("$listeners を検出", () => {
    const content = `<template><child v-on="$listeners" /></template>`;
    const sfc = extractSfcParts(content, true);
    const hits = findHitsInContent(content, sfc, "test.vue");
    expect(hits.some((h) => h.ruleId === "listeners")).toBe(true);
  });

  it("beforeDestroy を検出", () => {
    const content = `export default { beforeDestroy() { cleanup(); } }`;
    const sfc = extractSfcParts(content, false);
    const hits = findHitsInContent(content, sfc, "test.js");
    expect(hits.some((h) => h.ruleId === "lifecycle_hooks")).toBe(true);
  });

  it("@click.native を検出", () => {
    const content = `<template><button @click.native="go">Go</button></template>`;
    const sfc = extractSfcParts(content, true);
    const hits = findHitsInContent(content, sfc, "test.vue");
    expect(hits.some((h) => h.ruleId === "v_on_native")).toBe(true);
  });

  it("クリーンなコードで空配列を返す", () => {
    const content = `export default { setup() { return {}; } }`;
    const sfc = extractSfcParts(content, false);
    const hits = findHitsInContent(content, sfc, "clean.vue");
    expect(hits).toEqual([]);
  });

  it("検出結果に正しいファイルパスが含まれる", () => {
    const content = `this.$set(obj, 'key', val)`;
    const sfc = extractSfcParts(content, false);
    const hits = findHitsInContent(content, sfc, "components/MyComp.vue");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.file).toBe("components/MyComp.vue");
  });
});

describe("buildRulesSummary", () => {
  it("同一 ruleId をまとめてカウントし count 降順でソート", () => {
    const hits = [
      createHit("filters", "a.vue"),
      createHit("filters", "b.vue"),
      createHit("filters", "a.vue"),
      createHit("listeners", "c.vue"),
    ];

    const summary = buildRulesSummary(hits);
    expect(summary[0]?.ruleId).toBe("filters");
    expect(summary[0]?.count).toBe(3);
    expect(summary[1]?.ruleId).toBe("listeners");
    expect(summary[1]?.count).toBe(1);
  });

  it("files を重複なくリスト化", () => {
    const hits = [
      createHit("filters", "a.vue"),
      createHit("filters", "a.vue"),
      createHit("filters", "b.vue"),
    ];

    const summary = buildRulesSummary(hits);
    expect(summary[0]?.files).toEqual(["a.vue", "b.vue"]);
  });
});

describe("countBySeverity", () => {
  it("各 severity を正しくカウント", () => {
    const hits = [
      createHit("filters", "a.vue", "error"),
      createHit("listeners", "b.vue", "error"),
      createHit("children", "c.vue", "warning"),
      createHit("nuxt_layout", "d.vue", "info"),
    ];

    const counts = countBySeverity(hits);
    expect(counts).toEqual({ error: 2, warning: 1, info: 1 });
  });

  it("空配列で {error:0, warning:0, info:0}", () => {
    expect(countBySeverity([])).toEqual({ error: 0, warning: 0, info: 0 });
  });
});

function createHit(
  ruleId: string,
  file: string,
  severity: "error" | "warning" | "info" = "error",
) {
  return {
    ruleId,
    category: "test",
    severity,
    label: ruleId,
    desc: "test desc",
    file,
    line: 1,
    lineText: "test",
    docs: "https://example.com",
  };
}
