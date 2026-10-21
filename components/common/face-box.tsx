import { cn } from "@/lib/utils";

export type FaceBoxRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type FaceBoxProps = {
  box: FaceBoxRect;
  confidence: string;
  className?: string;
};

const percent = (fraction: number) => `${fraction * 100}%`;

export function FaceBox({ box, confidence, className }: FaceBoxProps) {
  return (
    <div
      aria-hidden
      data-slot="face-box"
      className={cn(
        "absolute rounded-[10px] border-[1.5px] border-primary-foreground",
        className,
      )}
      style={{
        left: percent(box.left),
        top: percent(box.top),
        width: percent(box.width),
        height: percent(box.height),
      }}
    >
      <span className="absolute -top-6 -left-px rounded-[5px] bg-primary px-1.75 py-0.75 font-mono text-[11px] leading-none font-medium whitespace-nowrap text-primary-foreground">
        FACE · {confidence}
      </span>
    </div>
  );
}
