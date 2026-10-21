import type { ReactNode } from "react";
import { TableOfContents } from "@/components/legal/table-of-contents";
import type { LegalSection } from "@/lib/constants/legal";

type LegalDocumentProps = {
  sections: readonly Pick<LegalSection, "id" | "title">[];
  children: ReactNode;
};

export function LegalDocument({ sections, children }: LegalDocumentProps) {
  return (
    <div className="mx-auto grid max-w-7xl gap-18 px-4 pt-14 pb-20 sm:px-14 lg:grid-cols-[220px_minmax(0,680px)]">
      <TableOfContents sections={sections} />
      <article className="flex flex-col gap-7">{children}</article>
    </div>
  );
}
