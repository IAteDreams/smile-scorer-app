import { Smile } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LINKS } from "@/lib/constants";

type LogoProps = {
  href?: string;
  className?: string;
};

export function Logo({ href = LINKS.public.home, className }: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-7.5 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Smile aria-hidden className="size-4.5" />
      </span>
      <span className="font-heading text-[17px] font-semibold">Smilescore</span>
    </Link>
  );
}
