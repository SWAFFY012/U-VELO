import type { Metadata } from "next";
import Image from "next/image";
import { BatteryCharging, HandCoins, Timer, Wrench, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { SectionHeading } from "@/components/ui/section-heading";
import { about, type AboutReason } from "@/data/about";

export const metadata: Metadata = {
  title: "О компании",
  description: about.metaDescription,
  alternates: { canonical: "/o-kompanii" },
};

const reasonIcons: Record<AboutReason["id"], LucideIcon> = {
  speed: Timer,
  fleet: BatteryCharging,
  service: Wrench,
  buyout: HandCoins,
};

export default function AboutPage() {
  const { intro, facts, terms, reasons, reasonsPhoto, closing } = about;

  return (
    <>
      <section aria-labelledby="about-title">
        <Container className="pt-32 pb-16 lg:pt-40 lg:pb-24">
          <SectionHeading as="h1" id="about-title" title="О компании" lead={about.lead} />

          <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <div className="cut cut-lg overflow-hidden bg-graphite-800">
              <Image
                src={intro.photo.src}
                alt={intro.photo.alt}
                width={intro.photo.width}
                height={intro.photo.height}
                sizes="(min-width: 1320px) 720px, (min-width: 1024px) 56vw, 100vw"
                loading="eager"
                className="h-auto w-full"
              />
            </div>
            <div className="flex flex-col gap-5">
              <h2 className="h3 text-chalk">{intro.title}</h2>
              {intro.paragraphs.map((paragraph) => (
                <p key={paragraph} className="max-w-[58ch] text-silver">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="about-facts-title">
        <Container className="py-16 lg:py-24">
          <SectionHeading id="about-facts-title" title="Цифры и факты" />
          <Reveal className="mt-10 lg:mt-14">
            <dl className="grid grid-cols-2 border-b border-graphite-700 lg:grid-cols-4">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex flex-col-reverse justify-end gap-3 border-t border-graphite-700 py-7 pr-4 even:border-l even:pl-5 lg:border-l lg:py-9 lg:pl-8 lg:first:border-l-0 lg:first:pl-0 lg:even:pl-8"
                >
                  <dt className="max-w-[18ch] text-[0.9375rem] leading-snug text-ash">{fact.label}</dt>
                  <dd className="nums font-display text-[clamp(2.75rem,2rem+3.4vw,4.5rem)] leading-none font-semibold tracking-[-0.04em] text-chalk">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="about-terms-title">
        <Container className="grid gap-10 py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-24">
          <SectionHeading id="about-terms-title" title="Как мы работаем" lead={about.termsLead} />
          <Stagger as="dl" className="border-b border-graphite-700">
            {terms.map((term) => (
              <StaggerItem
                as="div"
                key={term.title}
                className="grid gap-2 border-t border-graphite-700 py-6 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-8"
              >
                <dt className="h3 text-chalk">{term.title}</dt>
                <dd className="text-silver">{term.text}</dd>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <section aria-labelledby="about-reasons-title">
        <Container className="py-16 lg:py-24">
          <SectionHeading id="about-reasons-title" title="Почему выбирают нас" />
          <Reveal className="mt-10 grid items-start gap-10 lg:mt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className="cut overflow-hidden bg-graphite-800">
              <Image
                src={reasonsPhoto.src}
                alt={reasonsPhoto.alt}
                width={reasonsPhoto.width}
                height={reasonsPhoto.height}
                sizes="(min-width: 1320px) 510px, (min-width: 1024px) 40vw, 100vw"
                className="h-auto w-full"
              />
            </div>
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {reasons.map((reason) => {
                const Icon = reasonIcons[reason.id];
                return (
                  <StaggerItem
                    key={reason.id}
                    className="cut flex flex-col gap-3 border border-graphite-700 bg-graphite-800 p-6"
                  >
                    <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-copper text-graphite-900">
                      <Icon aria-hidden="true" strokeWidth={1.75} className="size-6" />
                    </span>
                    <h3 className="h3 text-chalk">{reason.title}</h3>
                    <p className="text-silver">{reason.text}</p>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="about-closing-title" className="border-t border-graphite-700 bg-graphite-800">
        <Container className="flex flex-col gap-8 py-16 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:py-24">
          <SectionHeading id="about-closing-title" title={closing.title} lead={closing.text} />
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <ButtonLink href="/uslugi/arenda" size="lg">
              Посмотреть модели
            </ButtonLink>
            <ButtonLink href="/kontakty" variant="secondary" size="lg">
              Связаться
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
