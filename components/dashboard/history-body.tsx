import { ScoreBar } from "@/components/common/score-bar";
import { PhotoThumbnail } from "@/components/dashboard/score-photo";
import { HISTORY_COLUMNS } from "@/lib/constants/dashboard";
import type { PhotoPicker } from "@/types/photo";
import type { HistoryRow } from "@/types/score";

type HistoryBodyProps = {
  rows: HistoryRow[];
  query: string;
  picker: PhotoPicker;
};

export function HistoryBody({ rows, query, picker }: HistoryBodyProps) {
  const search = query.trim();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-170 text-sm">
        <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
          <tr className="border-b">
            {HISTORY_COLUMNS.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-4 py-2.5 font-medium first:pl-6 last:pr-6"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={HISTORY_COLUMNS.length}
                className="px-6 py-10 text-center text-muted-foreground"
              >
                {search
                  ? `No photos match “${search}”.`
                  : "No photos yet. Upload one to see it here."}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => picker.show(row.id)}
                className="cursor-pointer border-b transition-colors last:border-b-0 hover:bg-muted/40"
              >
                <td className="py-3 pr-4 pl-6">
                  <button
                    type="button"
                    aria-label={`View ${row.fileName}`}
                    className="block rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                  >
                    <PhotoThumbnail
                      id={row.id}
                      photoUrl={row.photoUrl}
                      hidden={row.id === picker.hiddenId}
                    />
                  </button>
                </td>
                <th
                  scope="row"
                  className="px-4 text-left font-medium whitespace-nowrap"
                >
                  {row.fileName}
                </th>
                <td className="px-4 whitespace-nowrap text-muted-foreground">
                  {row.uploaded}
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 font-medium tabular-nums">
                      {row.score}
                    </span>
                    <ScoreBar value={row.score} className="min-w-16 flex-1" />
                  </div>
                </td>
                <td className="px-4">
                  <span className="inline-flex h-5.5 items-center rounded-full border px-2 text-xs font-medium">
                    {row.emotion}
                  </span>
                </td>
                <td className="pr-6 pl-4 font-mono text-[13px] text-muted-foreground">
                  {row.confidence}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
