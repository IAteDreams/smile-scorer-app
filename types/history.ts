import type { Pagination } from "@/types/pagination";
import type { HistoryRow, HistorySort, ScoreEntry } from "@/types/score";

export type HistoryOptions = {
  now: number;
  timeZone: string;
  pageSize?: number;
};

/** What `useHistory` returns: search, sort, the current page and its rows. */
export type HistoryState = {
  query: string;
  sort: HistorySort;
  pagination: Pagination<ScoreEntry>;
  rows: HistoryRow[];
  onQueryChange: (query: string) => void;
  onSortChange: (sort: HistorySort) => void;
};

/** The search and sort controls shown in the history header. */
export type HistoryFilters = Pick<
  HistoryState,
  "query" | "sort" | "onQueryChange" | "onSortChange"
>;
