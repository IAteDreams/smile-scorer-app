import { Button } from "@/components/ui/button";
import type { PaginationControls } from "@/types/pagination";

export function HistoryFooter({
  pagination,
}: {
  pagination: PaginationControls;
}) {
  const { total, start, end, hasPrevious, hasNext, onPrevious, onNext } =
    pagination;

  return (
    <div className="flex items-center justify-between gap-3 border-t px-6 py-3 text-[13px] text-muted-foreground">
      <span aria-live="polite">
        {total === 0 ? "No results" : `Showing ${start}–${end} of ${total}`}
      </span>
      <div className="flex gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={!hasPrevious}
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={!hasNext}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
