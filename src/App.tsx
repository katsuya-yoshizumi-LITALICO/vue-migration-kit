import { Card, CardContent } from "@/components/ui/card";
import { useScan } from "@/features/scanner/useScan.js";
import { ScanForm } from "@/features/scanner/ScanForm.js";
import { ReportView } from "@/features/report/ReportView.js";

export function App() {
  const { status, report, errorMessage, scanDirectory, scanZip, loadReport, reset } =
    useScan();

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
          onScanDirectory={scanDirectory}
          onScanZip={scanZip}
          onLoadReport={loadReport}
          onReset={reset}
          errorMessage={errorMessage}
        />

        {status === "idle" && (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-bold">使い方</h2>
              <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
                <li>
                  「フォルダを選択」でプロジェクトディレクトリを選択、
                  または「ZIP ファイルを選択」で ZIP を選択
                </li>
                <li>自動的にスキャンが開始されます</li>
                <li>移行に必要な変更箇所がレポートで表示されます</li>
              </ol>
            </CardContent>
          </Card>
        )}

        {status === "scanning" && (
          <div className="flex flex-col items-center gap-4 py-16 text-muted-foreground">
            <div className="h-12 w-12 animate-pulse rounded-full bg-primary" />
            <p>スキャン中...</p>
          </div>
        )}

        {status === "done" && report && <ReportView report={report} />}
      </main>
    </div>
  );
}
