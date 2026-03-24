import type { RuleSummary, Severity } from "@/shared/types/index";
import { groupRulesByCategory } from "./reportUtils";

interface RuleOverviewProps {
  rulesSummary: RuleSummary[];
  onRuleClick: (ruleId: string) => void;
}

const dotColor: Record<Severity, string> = {
  error: "bg-severity-error",
  warning: "bg-severity-warning",
  info: "bg-severity-info",
};

export function RuleOverview({ rulesSummary, onRuleClick }: RuleOverviewProps) {
  const grouped = groupRulesByCategory(rulesSummary);

  return (
    <div className="space-y-6">
      {[...grouped.entries()].map(([category, rules]) => (
        <section key={category} className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {category}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {rules.map((rule) => (
              <button
                key={rule.ruleId}
                type="button"
                className="cursor-pointer rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:ring-2 hover:ring-primary/20 active:scale-95"
                onClick={() => onRuleClick(rule.ruleId)}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${dotColor[rule.severity]}`}
                  />
                  <span className="text-sm font-bold">{rule.label}</span>
                </div>
                <div className="mb-2 flex gap-3">
                  <span className="font-mono text-sm">{rule.count} 件</span>
                  <span className="text-sm text-muted-foreground">
                    {rule.files.length} ファイル
                  </span>
                </div>
                <a
                  href={rule.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  docs
                </a>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
