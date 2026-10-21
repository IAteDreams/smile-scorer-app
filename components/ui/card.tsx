import type { ComponentProps } from "react";
import { cn } from "cn";

type CardElement = "div" | "section" | "article" | "li" | "figure";

type CardProps = ComponentProps<"div"> & { as?: CardElement };

function Card({ as = "div", className, ...props }: CardProps) {
  const Element = as as "div";
  return (
    <Element
      data-slot="card"
      className={cn(
        "flex flex-col rounded-xl border bg-card text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min items-start gap-0.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-action]:gap-x-3",
        className,
      )}
      {...props}
    />
  );
}

type CardTitleProps = ComponentProps<"h2"> & { as?: "h2" | "h3" };

function CardTitle({
  as: Element = "h2",
  className,
  ...props
}: CardTitleProps) {
  return (
    <Element
      data-slot="card-title"
      className={cn("text-[15px] font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-[13px] text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-center justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardAction, CardDescription, CardHeader, CardTitle };
