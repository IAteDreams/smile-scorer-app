"use client";

import { useState } from "react";
import { DashboardIntro } from "@/components/dashboard/dashboard-intro";
import { HistoryTable } from "@/components/dashboard/history-table";
import { PhotoDetails } from "@/components/dashboard/photo-details";
import { ScoreBreakdown } from "@/components/dashboard/score-breakdown";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { StatCards } from "@/components/dashboard/stat-cards";
import {
  firstName,
  getBreakdown,
  getChartEntries,
  getHistory,
  getStats,
  greeting,
  toChartPoint,
  toStatSummary,
} from "@/lib/dashboard";
import { useHistory } from "@/lib/hooks/use-history";
import { usePhotoUrls } from "@/lib/hooks/use-photo-urls";
import { usePhotoViewer } from "@/lib/hooks/use-photo-viewer";
import { useTimeZone } from "@/lib/hooks/use-time-zone";
import type { ChartRange, ScoreEntry } from "@/types/score";

type DashboardViewProps = {
  name: string;
  now: number;
  entries: ScoreEntry[];
};

export function DashboardView({ name, now, entries }: DashboardViewProps) {
  const timeZone = useTimeZone();
  const [range, setRange] = useState<ChartRange>("recent");

  const stats = getStats(entries, now, timeZone);
  const statSummary = toStatSummary(stats, now, timeZone);
  const chartPoints = getChartEntries(entries, range, now).map((entry) =>
    toChartPoint(entry, now, timeZone),
  );
  const latest = getHistory(entries, { query: "", sort: "newest" })[0];

  const photos = usePhotoUrls(entries);
  const history = useHistory(photos.entries, { now, timeZone });
  const viewer = usePhotoViewer(photos.entries, {
    now,
    timeZone,
    onPhotoError: photos.refresh,
  });

  return (
    <div className="flex flex-col gap-6">
      <DashboardIntro
        title={`${greeting(now, timeZone)}, ${firstName(name)}`}
        summary={
          latest
            ? `You've scored ${stats.count} ${stats.count === 1 ? "photo" : "photos"}. Your last smile was a ${latest.score}.`
            : "Upload a photo to get your first smile score."
        }
      />
      <StatCards stats={statSummary} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScoreChart
            range={range}
            onRangeChange={setRange}
            points={chartPoints}
          />
        </div>
        <ScoreBreakdown bands={getBreakdown(entries)} total={entries.length} />
      </div>
      <HistoryTable history={history} picker={viewer} />
      <PhotoDetails {...viewer.dialog} />
    </div>
  );
}
