import { ArrowRight, ScanFace } from "lucide-react";
import Link from "next/link";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { buttonVariants } from "@/components/ui/button";
import { LINKS } from "@/lib/constants/links";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-14 pb-20 sm:px-14 lg:grid-cols-[1.05fr_1fr] lg:pt-22 lg:pb-24">
      <div className="flex flex-col gap-6">
        <span className="inline-flex h-7 items-center gap-2 self-start rounded-full border px-3 text-[13px] text-muted-foreground">
          <ScanFace aria-hidden className="size-3.5" />
          Powered by AWS Rekognition
        </span>
        <h1 className="font-heading text-[40px] leading-[1.04] font-semibold tracking-[-0.035em] text-balance sm:text-[62px]">
          How big is your smile, really?
        </h1>
        <p className="max-w-120 text-lg leading-[1.55] text-pretty text-muted-foreground">
          Upload a photo and get a smile score from 0 to 100 in seconds. Every
          result is saved to your history, so you can see how your smiles change
          over time.
        </p>
        <div className="mt-2 flex flex-wrap gap-2.5">
          <Link
            href={LINKS.guest.signUp}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 rounded-[10px] px-5 text-[15px]",
            )}
          >
            Score my smile
            <ArrowRight aria-hidden />
          </Link>
          <Link
            href={LINKS.public.howItWorks}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 rounded-[10px] px-5 text-[15px]",
            )}
          >
            See how it works
          </Link>
        </div>
        <p className="text-[13px] text-muted-foreground">
          Free. No credit card. Delete your photos at any time.
        </p>
      </div>

      <HeroVisual />
    </section>
  );
}
