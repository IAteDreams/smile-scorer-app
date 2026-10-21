import Link from "next/link";
import { LEGAL_TABS } from "@/lib/constants/legal";
import { cn } from "@/lib/utils";

type LegalTabsProps = {
  current: (typeof LEGAL_TABS)[number]["href"];
};

export function LegalTabs({ current }: LegalTabsProps) {
  return (
    <nav aria-label="Legal pages">
      <ul className="flex gap-1.5 text-[13px]">
        {LEGAL_TABS.map((tab) => {
          const active = tab.href === current;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-full px-2.5 py-1",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
