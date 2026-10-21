import { useState } from "react";
import type { Pagination } from "@/types/pagination";

export function usePagination<T>(
  items: readonly T[],
  pageSize: number,
): Pagination<T> {
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const offset = current * pageSize;
  const pageItems = items.slice(offset, offset + pageSize);

  return {
    items: pageItems,
    total: items.length,
    start: pageItems.length === 0 ? 0 : offset + 1,
    end: offset + pageItems.length,
    hasPrevious: current > 0,
    hasNext: current < pageCount - 1,
    onPrevious: () => setPage(current - 1),
    onNext: () => setPage(current + 1),
    reset: () => setPage(0),
  };
}
