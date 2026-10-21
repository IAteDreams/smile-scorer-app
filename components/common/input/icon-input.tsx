import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type IconInputProps = ComponentProps<"input"> & {
  icon: LucideIcon;
  trailing?: ReactNode;
};

export function IconInput({
  icon: Icon,
  trailing,
  className,
  ...props
}: IconInputProps) {
  return (
    <div className="relative">
      <Icon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        className={cn(
          "h-9.5 rounded-lg border-input bg-background pl-9 focus-visible:border-primary",
          trailing && "pr-9",
          className,
        )}
        {...props}
      />
      {trailing && (
        <div className="absolute top-1/2 right-3 flex -translate-y-1/2">
          {trailing}
        </div>
      )}
    </div>
  );
}
