import { ShieldCheck } from "lucide-react";
import { LegalDocument } from "@/components/legal/legal-document";
import { LegalTabs } from "@/components/legal/legal-tabs";
import { PRIVACY_POLICY } from "@/lib/constants/legal";
import { LINKS } from "@/lib/constants/links";

export function PrivacyPolicy() {
  const { lastUpdated, summary, sections } = PRIVACY_POLICY;

  return (
    <LegalDocument sections={sections}>
      <div className="flex flex-col gap-2.5">
        <LegalTabs current={LINKS.public.privacy} />
        <h1 className="mt-2 font-heading text-[40px] font-semibold tracking-[-0.03em]">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated {lastUpdated}
        </p>
      </div>

      <div className="flex gap-3 rounded-[10px] bg-muted px-4.5 py-4 text-sm leading-[1.6]">
        <ShieldCheck aria-hidden className="mt-0.5 size-4.5 shrink-0" />
        <p>
          <strong className="font-medium">In short:</strong> {summary}
        </p>
      </div>

      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          className="scroll-mt-8"
        >
          <h2
            id={`${section.id}-heading`}
            className="mb-2.5 font-heading text-xl font-semibold"
          >
            {index + 1}. {section.title}
          </h2>
          <div className="flex flex-col gap-3 text-[15px] leading-[1.7] text-foreground/80">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}
    </LegalDocument>
  );
}
