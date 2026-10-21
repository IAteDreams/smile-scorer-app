export type PaginationControls = {
  total: number;
  start: number;
  end: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export type Pagination<T> = PaginationControls & {
  items: T[];
  reset: () => void;
};
