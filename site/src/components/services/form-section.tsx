import { LeadForm } from "@/components/lead-form";
import { Container } from "@/components/ui/container";
import { LedLine } from "@/components/ui/led-line";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { LeadKind } from "@/lib/lead-schema";
import { site } from "@/lib/site";

/**
 * Финальный блок страницы услуги: призыв и форма заявки на фоне реек.
 * id="zayavka" нужен кнопкам каталога и ссылкам из шапки, чтобы прокрутить к форме.
 */
export function FormSection({ kind, title, text }: { kind: LeadKind; title: string; text: string }) {
  return (
    <section id="zayavka" aria-labelledby="zayavka-title" className="slats scroll-mt-24">
      <Container className="grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-24">
        <Reveal className="flex flex-col gap-6">
          <SectionHeading id="zayavka-title" title={title} lead={text} />
          <p className="text-silver">
            Можно и позвонить:{" "}
            <a
              href={site.phoneHref}
              className="nums inline-flex min-h-11 items-center font-semibold whitespace-nowrap text-chalk underline decoration-chalk/40 underline-offset-4 transition-colors duration-150 hover:text-amber"
            >
              {site.phone}
            </a>
            <span className="block">{site.hours}</span>
          </p>
        </Reveal>
        <LeadForm kind={kind} />
      </Container>
      <LedLine full />
    </section>
  );
}
