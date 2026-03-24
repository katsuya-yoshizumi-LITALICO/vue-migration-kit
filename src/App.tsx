import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScan } from "@/features/scanner/useScan";
import { ScanForm } from "@/features/scanner/ScanForm";
import { ReportView } from "@/features/report/ReportView";
import { exportToExcel } from "@/features/report/exportReport";
import { exportToExportsDir } from "@/shared/utils/api";

export function App() {
  const {
    status,
    reports,
    currentIndex,
    errorMessage,
    progress,
    scanDirectory,
    scanMultipleDirectories,
    scanZip,
    scanFromTargets,
    loadReport,
    setCurrentIndex,
    removeReport,
    reset,
  } = useScan();

  const currentReport = reports[currentIndex] ?? null;

  async function handleExportAll(): Promise<void> {
    for (const report of reports) {
      await exportToExcel(report);
    }
  }

  async function handleExportToExports(): Promise<void> {
    const saved = await exportToExportsDir(reports);
    alert(`exports/ に ${String(saved.length)} 件保存しました`);
  }

  return (
    <div className="mx-auto max-w-5xl min-h-screen px-6 py-10">
      <header className="mb-12 text-center">
        <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-primary to-[oklch(0.65_0.2_300)] bg-clip-text text-transparent">
          Vue Migration Kit
        </h1>
        <p className="text-muted-foreground">
          Vue 2 / Nuxt 2 → Vue 3 / Nuxt 3 移行影響範囲スキャナー
        </p>
      </header>

      <main className="space-y-6">
        <ScanForm
          status={status}
          hasReports={reports.length > 0}
          progress={progress}
          onScanDirectory={scanDirectory}
          onScanMultiple={scanMultipleDirectories}
          onScanZip={scanZip}
          onScanFromTargets={scanFromTargets}
          onLoadReport={loadReport}
          onReset={reset}
          errorMessage={errorMessage}
        />

        {status === "idle" && reports.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-bold">使い方</h2>
              <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
                <li>
                  「フォルダを選択」で1つのプロジェクトをスキャン、
                  「複数フォルダを選択」で連続してフォルダを追加
                </li>
                <li>自動的にスキャンが開始されます</li>
                <li>移行に必要な変更箇所がレポートで表示されます</li>
                <li>複数プロジェクトの結果を個別にエクスポートできます</li>
              </ol>
            </CardContent>
          </Card>
        )}

        {status === "scanning" && (
          <div className="flex flex-col items-center gap-4 py-16 text-muted-foreground">
            <div className="h-12 w-12 animate-pulse rounded-full bg-primary" />
            {progress ? (
              <p>
                スキャン中...{" "}
                {progress.total > 1
                  ? `(${String(progress.current)}/${String(progress.total)}) `
                  : ""}
                {progress.dirName}
              </p>
            ) : (
              <p>スキャン中...</p>
            )}
          </div>
        )}

        {reports.length > 0 && (
          <div className="space-y-4">
            {/* Project tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {reports.map((r, i) => (
                <button
                  key={`${r.targetDir}-${r.generatedAt}`}
                  onClick={() => setCurrentIndex(i)}
                  className={`group relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    i === currentIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {r.targetDir}
                  <span
                    className={`ml-2 text-xs opacity-60 hover:opacity-100 ${
                      i === currentIndex
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-destructive"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeReport(i);
                    }}
                  >
                    ×
                  </span>
                </button>
              ))}
              {reports.length >= 2 && (
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleExportAll()}
                  >
                    全てダウンロード ({String(reports.length)}件)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleExportToExports()}
                  >
                    exports/ に保存
                  </Button>
                </div>
              )}
            </div>

            {currentReport && <ReportView report={currentReport} />}
          </div>
        )}
      </main>
    </div>
  );
}
