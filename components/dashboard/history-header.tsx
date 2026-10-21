import { ArrowDownWideNarrow, Search } from "lucide-react";
import { IconInput } from "@/components/common/input";
import { buttonVariants } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HISTORY_SORTS } from "@/lib/constants/dashboard";
import { cn } from "@/lib/utils";
import type { HistoryFilters } from "@/types/history";
import type { HistorySort } from "@/types/score";

type HistoryHeaderProps = {
  titleId: string;
  filters: HistoryFilters;
};

export function HistoryHeader({ titleId, filters }: HistoryHeaderProps) {
  const { query, sort, onQueryChange, onSortChange } = filters;
  const sortLabel = HISTORY_SORTS.find(
    (option) => option.value === sort,
  )?.label;

  return (
    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <CardTitle id={titleId}>History</CardTitle>
      <div className="flex gap-2">
        <div className="flex-1 sm:w-55 sm:flex-none">
          <IconInput
            icon={Search}
            type="search"
            aria-label="Search photos"
            placeholder="Search photos…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="h-8.5 text-[13px]"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8.5 rounded-lg text-[13px]",
            )}
          >
            <ArrowDownWideNarrow aria-hidden />
            {sortLabel}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(value) => onSortChange(value as HistorySort)}
            >
              {HISTORY_SORTS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
