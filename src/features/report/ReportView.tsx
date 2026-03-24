import { useState, useTransition } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { ScanReport, Severity } from "@/shared/types/index.js";
import { StatsBar, type StatsFilter } from "./StatsBar.js";
import { RuleOverview } from "./RuleOverview.js";
import { HitList } from "./HitList.js";
import { RuleOverviewSkeleton, HitListSkeleton } from "./ReportSkeleton.js";
import { exportToExcel, exportToJson } from "./exportReport.js";

interface ReportViewProps {
  report: ScanReport;
}

export function ReportView({ report }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState("rules");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">(
    "all",
  );
  const [activeStatsFilter, setActiveStatsFilter] =
    useState<StatsFilter | null>(null);
  const [detailRule, setDetailRule] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRuleClick(ruleId: string): void {
    const rule = report.rulesSummary.find((r) => r.ruleId === ruleId);
    if (!rule) return;
    startTransition(() => {
      setDetailRule({ id: ruleId, label: rule.label });
      setActiveTab("detail");
      setActiveStatsFilter(null);
    });
  }

  function handleStatsClick(filter: StatsFilter): void {
    startTransition(() => {
      setActiveStatsFilter(filter);
      setDetailRule(null);
      if (filter === "files" || filter === "all") {
        setSeverityFilter("all");
      } else {
        setSeverityFilter(filter);
      }
      setActiveTab("files");
    });
  }

  function handleTabChange(tab: string): void {
    startTransition(() => {
      setActiveTab(tab);
      if (tab !== "files") {
        setActiveStatsFilter(null);
      }
    });
  }

  const detailHits = detailRule
    ? report.hits.filter((h) => h.ruleId === detailRule.id)
    : [];

  function renderSkeleton(): React.ReactNode {
    if (activeTab === "rules") return <RuleOverviewSkeleton />;
    return <HitListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <StatsBar
        report={report}
        onFilterClick={handleStatsClick}
        activeFilter={activeStatsFilter}
      />

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void exportToExcel(report)}
        >
          Excel エクスポート
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToJson(report)}
        >
          JSON 保存
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="rules">ルール別</TabsTrigger>
          <TabsTrigger value="files">ファイル別</TabsTrigger>
          {detailRule && (
            <TabsTrigger value="detail" className="gap-1">
              {detailRule.label}
              <span
                className="ml-1 cursor-pointer text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  startTransition(() => {
                    setDetailRule(null);
                    setActiveTab("rules");
                  });
                }}
              >
                ×
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        {isPending ? (
          <div className="pt-2 animate-in fade-in-0 duration-150">
            {renderSkeleton()}
          </div>
        ) : (
          <>
            <TabsContent value="rules">
              <RuleOverview
                rulesSummary={report.rulesSummary}
                onRuleClick={handleRuleClick}
              />
            </TabsContent>

            <TabsContent value="files">
              <HitList hits={report.hits} initialFilter={severityFilter} />
            </TabsContent>

            {detailRule && (
              <TabsContent value="detail">
                <HitList hits={detailHits} />
              </TabsContent>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
}
