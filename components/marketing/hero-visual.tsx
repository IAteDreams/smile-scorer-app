import Image from "next/image";
import { FaceBox } from "@/components/common/face-box";
import { ScoreRing } from "@/components/common/score-ring";
import { Card } from "@/components/ui/card";
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
        <FaceBox
          box={{ left: 0.29, top: 0.47, width: 0.18, height: 0.21 }}
          confidence="99.8%"
        />
      </div>

      <Card className="absolute right-0 bottom-0 w-59 flex-row items-center gap-4 rounded-[14px] p-4.5 shadow-[0_12px_32px_-8px_rgba(20,24,28,0.18)] sm:bottom-9">
        <ScoreRing score={92} />
        <div>
          <div className="font-heading text-[15px] font-semibold">Beaming</div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">
            Happy · 98.1% conf.
          </div>
        </div>
      </Card>
    </div>
  );
}
