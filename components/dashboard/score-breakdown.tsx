import { ScoreBar } from "@/components/common/score-bar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ScoreBand } from "@/lib/dashboard";

type ScoreBreakdownProps = {
  bands: ScoreBand[];
  total: number;
};

export function ScoreBreakdown({ bands, total }: ScoreBreakdownProps) {
  const largest = Math.max(1, ...bands.map((band) => band.count));

  return (
    <Card
      as="section"
      aria-labelledby="score-breakdown-title"
      className="gap-3.5 px-6 py-5"
    >
      <CardHeader>
        <CardTitle id="score-breakdown-title">Score breakdown</CardTitle>
        <CardDescription>
          {total === 0
            ? "No photos yet"
            : `All ${total} ${total === 1 ? "photo" : "photos"}`}
        </CardDescription>
      </CardHeader>
      <ul className="flex flex-col gap-3.5">
        {bands.map((band) => (
          <li key={band.label} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[13px]">
              <span>
                {band.label}{" "}
                <span className="text-muted-foreground">
                  {band.min}–{band.max}
                </span>
              </span>
              <span className="font-medium">{band.count}</span>
            </div>
            <ScoreBar value={band.count} max={largest} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
