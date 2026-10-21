import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LINKS } from "@/lib/constants/links";
import { cn } from "@/lib/utils";

export function HeaderActions({ signedIn }: { signedIn: boolean }) {
  if (signedIn) {
    return (
      <Link
        href={LINKS.protected.dashboard}
        className={cn(buttonVariants(), "rounded-lg")}
      >
        <LayoutDashboard aria-hidden />
        Go to dashboard
      </Link>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href={LINKS.guest.signIn}
        className={cn(buttonVariants({ variant: "outline" }), "rounded-lg")}
      >
        Sign in
      </Link>
      <Link
        href={LINKS.guest.signUp}
        className={cn(buttonVariants(), "rounded-lg")}
      >
        Get started
      </Link>
    </div>
  );
}

export function HeaderActionsSkeleton() {
  return <div aria-hidden className="h-9 w-44 rounded-lg bg-muted" />;
}
