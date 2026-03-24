import { Badge } from "@/components/ui/badge";
import type { Severity } from "../types/index";

const variantMap: Record<Severity, string> = {
  error: "bg-severity-error/15 text-severity-error border-severity-error/25",
  warning:
    "bg-severity-warning/15 text-severity-warning border-severity-warning/25",
  info: "bg-severity-info/15 text-severity-info border-severity-info/25",
};

interface SeverityBadgeProps {
  severity: Severity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <Badge variant="outline" className={`text-xs uppercase ${variantMap[severity]}`}>
      {severity}
    </Badge>
  );
}
