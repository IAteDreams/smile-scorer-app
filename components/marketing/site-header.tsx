import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { buttonVariants } from "@/components/ui/button";
import { LINKS } from "@/lib/constants/links";
import { MARKETING_NAV } from "@/lib/constants/marketing";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-14">
        <Logo />
        <nav
          aria-label="Main"
          className="hidden gap-7 text-sm text-muted-foreground md:flex"
        >
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
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
      </div>
    </header>
  );
}
