import { ScoreBar } from "@/components/common/score-bar";
import { PhotoThumbnail } from "@/components/dashboard/score-photo";
import { cn } from "@/lib/utils";
import type { PhotoPicker } from "@/types/photo";
import type { HistoryRow } from "@/types/score";

const detailsId = (id: string) => `history-card-${id}`;

type HistoryCardsProps = {
  rows: HistoryRow[];
  picker: PhotoPicker;
  className?: string;
};

export function HistoryCards({ rows, picker, className }: HistoryCardsProps) {
  return (
    <ul
      aria-label="Photos"
      className={cn("flex flex-col gap-2 p-4", className)}
    >
      {rows.map((row) => (
        <li key={row.id}>
          <button
            type="button"
            aria-label={`View ${row.fileName}`}
            aria-describedby={detailsId(row.id)}
            onClick={() => picker.show(row.id)}
            className="flex w-full items-center gap-3 rounded-[10px] border p-3 text-left text-sm transition-colors outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <PhotoThumbnail
              id={row.id}
              photoUrl={row.photoUrl}
              thumbnailUrl={row.thumbnailUrl}
              hidden={row.id === picker.hiddenId}
              onError={() => void picker.onPhotoError(row.id)}
            />
            <span
              id={detailsId(row.id)}
              className="flex min-w-0 flex-1 flex-col gap-1"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate font-medium">{row.fileName}</span>
                <span className="font-medium tabular-nums">{row.score}</span>
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {row.uploaded}
              </span>
              <span className="mt-1 flex items-center gap-2.5">
                <ScoreBar value={row.score} className="flex-1" />
                <span className="inline-flex h-5 items-center gap-1.5 rounded-full border px-2 text-xs font-medium">
                  {row.emotion}
                  <span className="font-mono font-normal text-muted-foreground">
                    {row.confidence}
                  </span>
                </span>
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
