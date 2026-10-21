import { Flame, Gauge, Images, Trophy, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { StatSummary, Streak } from "@/types/score";

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

function changeText(change: number | null) {
  if (change === null) return "Across all your photos";
  if (change === 0) return "Same as previous 30 days";
  return `${change > 0 ? "+" : "−"}${Math.abs(change)} vs. previous 30 days`;
}

function streakText({ days, scoredToday }: Streak) {
  if (days === 0) return "Upload a photo to start one";
  return scoredToday ? "You scored today" : "Upload today to keep it";
}

export function StatCards({ stats }: { stats: StatSummary }) {
  const { average, averageChange, best, count, thisWeek, streak } = stats;

  const cards: {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
  }[] = [
    {
      label: "Average score",
      value: average === null ? "—" : String(average),
      detail: changeText(averageChange),
      icon: Gauge,
    },
    {
      label: "Best score",
      value: best ? String(best.score) : "—",
      detail: best ? `${best.fileName} · ${best.day}` : "No photos yet",
      icon: Trophy,
    },
    {
      label: "Photos scored",
      value: String(count),
      detail: `${thisWeek} this week`,
      icon: Images,
    },
    {
      label: "Smile streak",
      value: plural(streak.days, "day"),
      detail: streakText(streak),
      icon: Flame,
    },
  ];

  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, detail, icon: Icon }) => (
        <Card key={label} className="gap-1.5 p-5">
          <dt className="flex items-center justify-between text-[13px] text-muted-foreground">
            {label}
            <Icon aria-hidden className="size-4" />
          </dt>
          <dd className="font-heading text-3xl font-semibold tracking-tight">
            {value}
          </dd>
          <dd className="truncate text-xs text-muted-foreground">{detail}</dd>
        </Card>
      ))}
    </dl>
  );
}
