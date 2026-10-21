import { HistoryBody } from "@/components/dashboard/history-body";
import { HistoryFooter } from "@/components/dashboard/history-footer";
import { HistoryHeader } from "@/components/dashboard/history-header";
import { Card } from "@/components/ui/card";
import type { HistoryState } from "@/types/history";
import type { PhotoPicker } from "@/types/photo";

const TITLE_ID = "history-title";

type HistoryTableProps = {
  history: HistoryState;
  picker: PhotoPicker;
};

export function HistoryTable({ history, picker }: HistoryTableProps) {
  return (
    <Card
      as="section"
      aria-labelledby={TITLE_ID}
      aria-busy={history.loading}
      className="overflow-hidden"
    >
      <HistoryHeader titleId={TITLE_ID} filters={history} />
      <HistoryBody
        rows={history.rows}
        query={history.query}
        picker={picker}
        loading={history.loading}
      />
      <HistoryFooter pagination={history.pagination} />
    </Card>
  );
}
