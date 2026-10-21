import { useRef, useState } from "react";
import { toast } from "sonner";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants/dashboard";
import { API } from "@/lib/constants/links";
import { toHistoryRow } from "@/lib/dashboard";
import { ERRORS } from "@/lib/error";
import { usePhotoUrls } from "@/lib/hooks/use-photo-urls";
import type { HistoryOptions, HistoryState } from "@/types/history";
import type { ApiResponse } from "@/types/return";
import type { HistorySort, ScorePage, ScoreQuery } from "@/types/score";

const FIRST_PAGE: ScoreQuery = { query: "", sort: "newest", page: 0 };

export function useHistory(
  initial: ScorePage,
  { now, timeZone }: HistoryOptions,
): HistoryState {
  const [page, setPage] = useState(initial);
  const [query, setQuery] = useState(FIRST_PAGE.query);
  const [sort, setSort] = useState<HistorySort>(FIRST_PAGE.sort);
  const [loading, setLoading] = useState(false);
  const latestRequest = useRef(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const photos = usePhotoUrls(page.items);

  const load = async (next: ScoreQuery) => {
    const request = ++latestRequest.current;
    setLoading(true);
    try {
      const response = await fetch(API.scores(next));
      const body = (await response.json()) as ApiResponse<ScorePage>;
      if (request !== latestRequest.current) return;
      if (body.success) setPage(body.data);
      else toast.error(ERRORS.history.loadFailed);
    } catch {
      if (request === latestRequest.current) {
        toast.error(ERRORS.history.loadFailed);
      }
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  };

  const pageCount = Math.max(1, Math.ceil(page.total / page.pageSize));
  const offset = page.page * page.pageSize;
  const items = photos.entries;

  return {
    query,
    sort,
    loading,
    pagination: {
      items,
      total: page.total,
      start: items.length === 0 ? 0 : offset + 1,
      end: offset + items.length,
      hasPrevious: page.page > 0,
      hasNext: page.page < pageCount - 1,
      onPrevious: () => void load({ query, sort, page: page.page - 1 }),
      onNext: () => void load({ query, sort, page: page.page + 1 }),
      reset: () => void load({ query, sort, page: 0 }),
    },
    rows: items.map((entry) => toHistoryRow(entry, now, timeZone)),
    onQueryChange: (value: string) => {
      setQuery(value);
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(
        () => void load({ query: value, sort, page: 0 }),
        SEARCH_DEBOUNCE_MS,
      );
    },
    onSortChange: (value: HistorySort) => {
      setSort(value);
      clearTimeout(searchTimer.current);
      void load({ query, sort: value, page: 0 });
    },
    reload: () => {
      clearTimeout(searchTimer.current);
      setQuery(FIRST_PAGE.query);
      setSort(FIRST_PAGE.sort);
      return load(FIRST_PAGE);
    },
    refreshPhoto: photos.refresh,
  };
}
