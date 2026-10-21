import { HOW_IT_WORKS_STEPS } from "@/lib/constants/marketing";
import { Card } from "@/components/ui/card";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-4 border-t bg-muted/40"
    >
      <div className="mx-auto max-w-7xl px-4 py-18 sm:px-14">
        <h2
          id="how-it-works-heading"
          className="mb-10 font-heading text-[32px] font-semibold tracking-tight"
        >
          Three steps to a score
        </h2>
        <ol className="grid gap-5 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map(({ icon: Icon, title, body }) => (
            <Card as="li" key={title} className="gap-2.5 p-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Icon aria-hidden className="size-4.5" />
              </span>
              <h3 className="mt-1.5 font-heading text-[17px] font-semibold">
                {title}
              </h3>
              <p className="text-sm leading-[1.55] text-muted-foreground">
                {body}
              </p>
            </Card>
          ))}
        </ol>
      </div>
    </section>
  );
}
