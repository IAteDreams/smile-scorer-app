import { ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { initials } from "@/lib/dashboard";

type AccountMenuProps = {
  name: string;
  email: string;
  pending?: boolean;
  onSignOut: () => void;
};

export function AccountMenu({
  name,
  email,
  pending = false,
  onSignOut,
}: AccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${email}`}
        className="flex items-center gap-3 rounded-lg p-1 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <span className="hidden text-muted-foreground sm:inline">{email}</span>
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full bg-primary text-[13px] font-medium text-primary-foreground"
        >
          {initials(name)}
        </span>
        <ChevronDown aria-hidden className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block text-sm font-medium text-foreground">
              {name}
            </span>
            {email}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={pending} onClick={onSignOut}>
          <LogOut aria-hidden />
          {pending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AccountMenuSkeleton() {
  return (
    <div aria-hidden className="flex items-center gap-3">
      <Skeleton className="hidden h-4 w-36 rounded sm:block" />
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
}
