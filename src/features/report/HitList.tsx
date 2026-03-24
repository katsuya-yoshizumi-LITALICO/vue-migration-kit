import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { ScanHit, Severity } from "@/shared/types/index.js";
import { SeverityBadge } from "@/shared/components/SeverityBadge.js";
import {
  groupHitsByFile,
  filterHitsBySeverity,
  sortHitsBySeverity,
} from "./reportUtils.js";

interface HitListProps {
  hits: ScanHit[];
  initialFilter?: Severity | "all";
}

const severityFilters: Array<Severity | "all"> = [
  "all",
  "error",
  "warning",
  "info",
];

export function HitList({ hits, initialFilter = "all" }: HitListProps) {
  const [filter, setFilter] = useState<Severity | "all">(initialFilter);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const filtered = sortHitsBySeverity(filterHitsBySeverity(hits, filter));
  const grouped = groupHitsByFile(filtered);

  function toggleCollapse(file: string): void {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(file)) {
        next.delete(file);
      } else {
        next.add(file);
      }
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {severityFilters.map((s) => (
          <Button
            key={s}
            type="button"
            size="sm"
            variant={filter === s ? "default" : "secondary"}
            className="text-xs uppercase"
            onClick={() => setFilter(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {[...grouped.entries()].map(([file, fileHits]) => (
        <div
          key={file}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 bg-secondary px-4 py-3 text-left font-mono text-sm"
            onClick={() => toggleCollapse(file)}
          >
            <span className="text-xs text-muted-foreground">
              {collapsed.has(file) ? "\u25B6" : "\u25BC"}
            </span>
            <span className="flex-1">{file}</span>
            <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted-foreground">
              {fileHits.length}
            </span>
          </button>

          {!collapsed.has(file) && (
            <div className="divide-y divide-border">
              {fileHits.map((hit, i) => (
                <div
                  key={`${hit.ruleId}-${hit.line}-${i}`}
                  className="flex items-center gap-3 px-4 py-2 text-sm"
                >
                  <SeverityBadge severity={hit.severity} />
                  <span className="min-w-[120px]">{hit.desc}</span>
                  <code className="flex-1 truncate font-mono text-xs text-muted-foreground">
                    {hit.lineText}
                  </code>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground/60">
                    L{hit.line}
                  </span>
                  <a
                    href={hit.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-primary hover:underline"
                  >
                    docs
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {grouped.size === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          該当するヒットはありません
        </p>
      )}
    </div>
  );
}
