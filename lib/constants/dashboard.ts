export const RECENT_UPLOADS = 14;

export const CHART_RANGES = [
  {
    value: "recent",
    label: `${RECENT_UPLOADS} uploads`,
    description: `Last ${RECENT_UPLOADS} uploads`,
  },
  { value: "30d", label: "30 days", description: "Last 30 days" },
  { value: "all", label: "All", description: "All uploads" },
] as const;

export const HISTORY_PAGE_SIZE = 6;

export const HISTORY_COLUMNS = [
  "Photo",
  "File",
  "Uploaded",
  "Smile score",
  "Emotion",
  "Confidence",
] as const;

export const HISTORY_SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest score" },
  { value: "lowest", label: "Lowest score" },
] as const;
