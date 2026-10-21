import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CHART_LIMIT, CHART_RANGES } from "@/lib/constants/dashboard";
import { cn } from "@/lib/utils";
import type { ChartPoint, ChartRange } from "@/types/score";

type ScoreChartProps = {
  points: ChartPoint[];
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
  /** True when "All" only covers the most recent uploads. */
  capped?: boolean;
};

export function ScoreChart({
  points,
  range,
  onRangeChange,
  capped = false,
}: ScoreChartProps) {
  const description =
    range === "all" && capped
      ? `Last ${CHART_LIMIT} uploads`
      : CHART_RANGES.find((option) => option.value === range)?.description;

  return (
    <Card
      as="section"
      aria-labelledby="score-chart-title"
      className="px-6 py-5"
    >
      <CardHeader>
        <CardTitle id="score-chart-title">Score over time</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction
          role="group"
          aria-label="Chart range"
          className="flex rounded-lg bg-muted p-0.75 text-xs"
        >
          {CHART_RANGES.map((option) => {
            const selected = option.value === range;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onRangeChange(option.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30",
                  selected &&
                    "bg-background font-medium text-foreground shadow-xs",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </CardAction>
      </CardHeader>

      {points.length === 0 ? (
        <p className="mt-6 flex h-45 items-center justify-center border-b text-sm text-muted-foreground">
          No photos in this range yet.
        </p>
      ) : (
        <ol
          aria-label="Scores from oldest to newest"
          className="mt-6 flex h-45 items-end gap-1 border-b bg-[repeating-linear-gradient(0deg,transparent_0_44px,var(--muted)_44px_45px)] sm:gap-2.5"
        >
          {points.map((point, index) => {
            const latest = index === points.length - 1;
            const position = index / points.length;
            return (
              <li
                key={point.id}
                tabIndex={0}
                aria-label={`${point.fileName}, ${point.date}: ${point.score}, ${point.label}`}
                className="group flex h-full min-w-0 flex-1 items-end outline-none"
              >
                <div
                  data-latest={latest || undefined}
                  className={cn(
                    "relative w-full rounded-t-lg bg-chart-1 transition-colors group-hover:bg-chart-2 group-focus-visible:bg-chart-2",
                    latest &&
                      "bg-primary group-hover:bg-primary group-focus-visible:bg-primary",
                  )}
                  style={{ height: `${Math.max(point.score, 1)}%` }}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute bottom-full z-10 mb-2 hidden rounded-md border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md group-hover:block group-focus-visible:block",
                      position < 0.25
                        ? "left-0"
                        : position >= 0.75
                          ? "right-0"
                          : "left-1/2 -translate-x-1/2",
                    )}
                  >
                    <div className="font-medium">
                      {point.score} · {point.label}
                    </div>
                    <div className="text-muted-foreground">
                      {point.fileName} · {point.date}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
