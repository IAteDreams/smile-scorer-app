import { useState } from "react";
import { HISTORY_PAGE_SIZE } from "@/lib/constants/dashboard";
import { getHistory, toHistoryRow } from "@/lib/dashboard";
import { usePagination } from "@/lib/hooks/use-pagination";
import type { HistoryOptions, HistoryState } from "@/types/history";
import type { HistorySort, ScoreEntry } from "@/types/score";

export function useHistory(
  entries: readonly ScoreEntry[],
  { now, timeZone, pageSize = HISTORY_PAGE_SIZE }: HistoryOptions,
): HistoryState {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<HistorySort>("newest");
  const pagination = usePagination(
    getHistory(entries, { query, sort }),
    pageSize,
  );

  return {
    query,
    sort,
    pagination,
    rows: pagination.items.map((entry) => toHistoryRow(entry, now, timeZone)),
    onQueryChange: (value: string) => {
      setQuery(value);
      pagination.reset();
    },
    onSortChange: (value: HistorySort) => {
      setSort(value);
      pagination.reset();
    },
  };
}
