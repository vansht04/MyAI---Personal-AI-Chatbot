import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import type { AnonymousQuota } from "../types";

interface QuotaBannerProps {
  quota: AnonymousQuota;
}

export function QuotaBanner({ quota }: QuotaBannerProps) {
  const pct = Math.min(1, quota.used / quota.limit);
  const isWarning = pct >= 0.7 && !quota.isExceeded;

  return (
    <div
      data-ocid="quota-banner"
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-xs border-t",
        isWarning
          ? "bg-warning-muted border-warning text-warning"
          : "bg-background border-border text-muted-foreground/60",
      )}
    >
      {isWarning && <AlertCircle className="h-3 w-3 shrink-0" />}
      <div className="flex items-center gap-2 flex-1">
        <span>
          {quota.used} of {quota.limit} free messages used
        </span>
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-24">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isWarning ? "bg-warning" : "bg-primary/40",
            )}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <span className="text-muted-foreground/40">
          {quota.remaining} remaining
        </span>
      </div>
    </div>
  );
}
