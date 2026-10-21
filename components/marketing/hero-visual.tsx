import Image from "next/image";
import groupOfFriends from "@/public/group_of_friends.webp";

export function HeroVisual() {
  return (
    <div className="relative pb-9 sm:pr-10 sm:pb-0">
      <div className="relative aspect-516/460 overflow-hidden rounded-2xl border bg-muted">
        <Image
          src={groupOfFriends}
          alt="Four friends smiling with their arms outstretched"
          fill
          placeholder="blur"
          fetchPriority="high"
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover object-[center_35%]"
        />
        <div
          aria-hidden
          className="absolute top-[47%] left-[29%] h-[21%] w-[18%] rounded-[10px] border-[1.5px] border-primary-foreground"
        >
          <span className="absolute -top-6 -left-px rounded-[5px] bg-primary px-1.75 py-0.75 font-mono text-[11px] leading-none font-medium whitespace-nowrap text-primary-foreground">
            FACE · 99.8%
          </span>
        </div>
      </div>

      <div className="absolute right-0 bottom-0 flex w-59 items-center gap-4 rounded-[14px] border bg-card p-4.5 shadow-[0_12px_32px_-8px_rgba(20,24,28,0.18)] sm:bottom-9">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(var(--primary)_0_92%,var(--border)_0)]">
          <div className="flex size-13 items-center justify-center rounded-full bg-card font-heading text-xl font-semibold">
            92
          </div>
        </div>
        <div>
          <div className="font-heading text-[15px] font-semibold">Beaming</div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">
            Happy · 98.1% conf.
          </div>
        </div>
      </div>
    </div>
  );
}
