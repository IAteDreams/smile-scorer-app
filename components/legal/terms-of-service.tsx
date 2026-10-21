import { LegalDocument } from "@/components/legal/legal-document";
import { LegalTabs } from "@/components/legal/legal-tabs";
import { LINKS } from "@/lib/constants/links";
import { TERMS_OF_SERVICE } from "@/lib/constants/legal";

export function TermsOfService() {
  const { effective, contactEmail, sections } = TERMS_OF_SERVICE;

  return (
    <LegalDocument sections={sections}>
      <div className="flex flex-col gap-2.5">
        <LegalTabs current={LINKS.public.terms} />
        <h1 className="mt-2 font-heading text-[40px] font-semibold tracking-[-0.03em]">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">Effective {effective}</p>
      </div>

      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          className="grid scroll-mt-8 grid-cols-[40px_1fr] gap-2 border-t pt-6"
        >
          <span
            aria-hidden
            className="pt-1 font-mono text-[13px] font-medium text-muted-foreground"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h2
              id={`${section.id}-heading`}
              className="mb-2 font-heading text-[19px] font-semibold"
            >
              {section.title}
            </h2>
            <div className="flex flex-col gap-3 text-[15px] leading-[1.7] text-foreground/80">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      ))}

      <p className="border-t pt-6 text-sm text-muted-foreground">
        Questions? Email{" "}
        <a
          href={`mailto:${contactEmail}`}
          className="underline underline-offset-2 hover:text-foreground"
        >
          {contactEmail}
        </a>
      </p>
    </LegalDocument>
  );
}
