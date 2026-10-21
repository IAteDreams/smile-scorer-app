"use client";

import { useState } from "react";
import { DashboardIntro } from "@/components/dashboard/dashboard-intro";
import { HistoryTable } from "@/components/dashboard/history-table";
import { PhotoDetails } from "@/components/dashboard/photo-details";
import { ScoreBreakdown } from "@/components/dashboard/score-breakdown";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { StatCards } from "@/components/dashboard/stat-cards";
import { CHART_LIMIT } from "@/lib/constants/dashboard";
import {
  firstName,
  getBreakdown,
  getChartEntries,
  greeting,
  toChartPoint,
  toStatSummary,
} from "@/lib/dashboard";
import { useHistory } from "@/lib/hooks/use-history";
import { usePhotoViewer } from "@/lib/hooks/use-photo-viewer";
import { useTimeZone } from "@/lib/hooks/use-time-zone";
import type { ChartRange, ScorePage, ScoreSummary } from "@/types/score";

type DashboardViewProps = {
  name: string;
  now: number;
  summary: ScoreSummary;
  history: ScorePage;
};

export function DashboardView({
  name,
  now,
  summary,
  history: firstPage,
}: DashboardViewProps) {
  const timeZone = useTimeZone();
  const [range, setRange] = useState<ChartRange>("recent");

  const statSummary = toStatSummary(summary, now, timeZone);
  const chartPoints = getChartEntries(summary.recent, range, now).map((entry) =>
    toChartPoint(entry, now, timeZone),
  );

  const history = useHistory(firstPage, { now, timeZone });
  const viewer = usePhotoViewer(history.pagination.items, {
    now,
    timeZone,
    totals: summary,
    onPhotoError: history.refreshPhoto,
  });

  return (
    <div className="flex flex-col gap-6">
      <DashboardIntro
        title={`${greeting(now, timeZone)}, ${firstName(name)}`}
        summary={
          summary.latest
            ? `You've scored ${summary.count} ${summary.count === 1 ? "photo" : "photos"}. Your last smile was a ${summary.latest.score}.`
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
            capped={summary.count > CHART_LIMIT}
          />
        </div>
        <ScoreBreakdown
          bands={getBreakdown(summary.bands)}
          total={summary.count}
        />
      </div>
      <HistoryTable history={history} picker={viewer} />
      <PhotoDetails {...viewer.dialog} />
    </div>
  );
}
