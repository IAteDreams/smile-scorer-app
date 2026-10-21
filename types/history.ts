import type { Pagination } from "@/types/pagination";
import type { PhotoUrlRefresh } from "@/types/photo";
import type { HistoryRow, HistorySort, ScoreEntry } from "@/types/score";

export type HistoryOptions = {
  now: number;
  timeZone: string;
};

/** What `useHistory` returns: search, sort, the current page and its rows. */
export type HistoryState = {
  query: string;
  sort: HistorySort;
  loading: boolean;
  pagination: Pagination<ScoreEntry>;
  rows: HistoryRow[];
  onQueryChange: (query: string) => void;
  onSortChange: (sort: HistorySort) => void;
  /** Back to the newest photos with no search, e.g. after an upload. */
  reload: () => Promise<void>;
  refreshPhoto: PhotoUrlRefresh;
};

/** The search and sort controls shown in the history header. */
export type HistoryFilters = Pick<
  HistoryState,
  "query" | "sort" | "onQueryChange" | "onSortChange"
>;
