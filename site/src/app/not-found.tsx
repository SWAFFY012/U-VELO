import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Страница не найдена",
};

// Корневой not-found отдаётся вместе с каждой страницей, поэтому здесь только серверная разметка.
export default function NotFound() {
  return (
    <Container className="flex flex-1 flex-col justify-center gap-8 pt-32 pb-24 lg:pt-40">
      <p
        aria-hidden="true"
        className="nums font-display text-[clamp(4.5rem,2.5rem+10vw,9rem)] leading-none font-bold tracking-[-0.05em] text-graphite-700"
      >
        404
      </p>
      <SectionHeading
        as="h1"
        title="Страница не найдена"
        lead="Такой страницы нет: возможно, в адресе ошибка или её перенесли."
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/" size="lg">
          На главную
        </ButtonLink>
        <ButtonLink href="/uslugi/arenda" variant="secondary" size="lg">
          Модели и цены
        </ButtonLink>
      </div>
    </Container>
  );
}
