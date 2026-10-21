import { cn } from "@/lib/utils";

type ScoreBarProps = {
  value: number;
  max?: number;
  className?: string;
};

export function ScoreBar({ value, max = 100, className }: ScoreBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div aria-hidden className={cn("h-1.5 rounded-full bg-muted", className)}>
      <div
        data-slot="score-bar-fill"
        className="h-1.5 rounded-full bg-primary"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
