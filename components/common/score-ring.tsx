import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ringVariants = cva(
  "flex shrink-0 items-center justify-center rounded-full",
  {
    variants: {
      size: {
        sm: "size-16",
        lg: "size-28",
      },
    },
    defaultVariants: { size: "sm" },
  },
);

const innerVariants = cva(
  "flex flex-col items-center justify-center rounded-full",
  {
    variants: {
      size: {
        sm: "size-13",
        lg: "size-24",
      },
    },
    defaultVariants: { size: "sm" },
  },
);

const valueVariants = cva("font-heading font-semibold", {
  variants: {
    size: {
      sm: "text-xl",
      lg: "text-4xl leading-none tracking-tight",
    },
  },
  defaultVariants: { size: "sm" },
});

type ScoreRingProps = VariantProps<typeof ringVariants> & {
  score: number;
  surfaceClassName?: string;
  className?: string;
};

export function ScoreRing({
  score,
  size,
  surfaceClassName = "bg-card",
  className,
}: ScoreRingProps) {
  const percent = Math.min(100, Math.max(0, score));

  return (
    <div
      data-slot="score-ring"
      className={cn(ringVariants({ size }), className)}
      style={{
        background: `conic-gradient(var(--primary) 0 ${percent}%, var(--border) 0)`,
      }}
    >
      <div className={cn(innerVariants({ size }), surfaceClassName)}>
        <span className={valueVariants({ size })}>{score}</span>
        {size === "lg" && (
          <span className="text-[11px] text-muted-foreground">/ 100</span>
        )}
      </div>
    </div>
  );
}
