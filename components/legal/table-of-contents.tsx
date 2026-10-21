import type { LegalSection } from "@/lib/constants/legal";

type TableOfContentsProps = {
  sections: readonly Pick<LegalSection, "id" | "title">[];
};

export function TableOfContents({ sections }: TableOfContentsProps) {
  return (
    <nav
      aria-labelledby="toc-heading"
      className="sticky top-8 hidden self-start lg:block"
    >
      <h2
        id="toc-heading"
        className="mb-2 text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase"
      >
        On this page
      </h2>
      <ol className="flex flex-col gap-0.5 text-sm">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="block rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
