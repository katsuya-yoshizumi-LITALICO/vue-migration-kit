import { Card, CardContent } from "@/components/ui/card";
import type { ScanReport, Severity } from "@/shared/types/index";
import { formatDuration } from "./reportUtils";

export type StatsFilter = Severity | "all" | "files";

interface StatsBarProps {
  report: ScanReport;
  onFilterClick: (filter: StatsFilter) => void;
  activeFilter?: StatsFilter | null;
}

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  colorClass?: string;
  onClick?: () => void;
  active?: boolean;
}

function StatCard({ label, value, description, colorClass, onClick, active }: StatCardProps) {
  return (
    <Card
      className={`flex-1 min-w-[100px] transition-all ${
        onClick ? "cursor-pointer hover:border-primary hover:ring-2 hover:ring-primary/20 active:scale-95" : ""
      } ${active ? "border-primary ring-2 ring-primary/20" : ""}`}
      onClick={onClick}
      title={description}
    >
      <CardContent className="p-3 text-center">
        <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
          {label}
        </span>
        <span
          className={`block text-2xl font-bold font-mono ${colorClass ?? ""}`}
        >
          {value}
        </span>
        {description && (
          <span className="block mt-1 text-[0.65rem] leading-tight text-muted-foreground/70">
            {description}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsBar({ report, onFilterClick, activeFilter }: StatsBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <StatCard
        label="Files"
        value={report.scannedFiles}
        onClick={() => onFilterClick("files")}
        active={activeFilter === "files"}
      />
      <StatCard
        label="Total"
        value={report.totalHits}
        onClick={() => onFilterClick("all")}
        active={activeFilter === "all"}
      />
      <StatCard
        label="Error"
        value={report.severity.error}
        description="廃止API — 必ず修正が必要"
        colorClass="text-severity-error"
        onClick={() => onFilterClick("error")}
        active={activeFilter === "error"}
      />
      <StatCard
        label="Warning"
        value={report.severity.warning}
        description="非推奨 — 対応を推奨"
        colorClass="text-severity-warning"
        onClick={() => onFilterClick("warning")}
        active={activeFilter === "warning"}
      />
      <StatCard
        label="Info"
        value={report.severity.info}
        description="要確認 — 書き換えで保守性向上"
        colorClass="text-severity-info"
        onClick={() => onFilterClick("info")}
        active={activeFilter === "info"}
      />
      <StatCard
        label="Time"
        value={formatDuration(report.durationMs)}
      />
    </div>
  );
}
