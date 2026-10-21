import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/logo";
import { MARKETING_NAV } from "@/lib/constants/marketing";

type SiteHeaderProps = {
  actions: ReactNode;
};

export function SiteHeader({ actions }: SiteHeaderProps) {
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
        {actions}
      </div>
    </header>
  );
}
