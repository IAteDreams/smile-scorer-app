import Link from "next/link";
import { LINKS } from "@/lib/constants/links";
import { cn } from "@/lib/utils";

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-7 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-14",
        className,
      )}
    >
      <span>© 2026 Smilescore</span>
      <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
        <Link href={LINKS.public.privacy} className="hover:text-foreground">
          Privacy Policy
        </Link>
        <Link href={LINKS.public.terms} className="hover:text-foreground">
          Terms of Service
        </Link>
      </nav>
    </footer>
  );
}
