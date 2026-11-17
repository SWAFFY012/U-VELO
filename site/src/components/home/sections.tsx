import Image from "next/image";
import { Clock, HandCoins, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { MarqueeGallery } from "@/components/ui/marquee-gallery";
import { Accordion } from "@/components/ui/accordion";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { LeadForm } from "@/components/lead-form";
import { bikes } from "@/data/bikes";
import { faq } from "@/data/faq";
import { galleryPhotos, galleryVideos } from "@/data/gallery";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

const sectionClass = "py-20 lg:py-28";

const advantages: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Clock, title: "Выдача за 15 минут", text: "Оформляем по паспорту и сразу выдаём электровелосипед." },
  {
    icon: ShieldCheck,
    title: "Обслуживание входит в аренду",
    text: "Плановое обслуживание и замена на время ремонта без доплат.",
  },
  { icon: HandCoins, title: "Можно выкупить", text: "Арендованный электровелосипед можно оставить себе." },
  { icon: Wrench, title: "Свой сервис и запчасти", text: "Чиним сами, не ждём поставок со стороны." },
];

export function Advantages() {
  return (
    <section aria-labelledby="advantages-title" className={sectionClass}>
      <Container>
        <SectionHeading id="advantages-title" title="Почему берут у нас" />
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-5">
          {advantages.map(({ icon: Icon, title, text }) => (
            <StaggerItem
              key={title}
              className="cut group flex min-h-[17rem] flex-col justify-between gap-10 border border-graphite-700 bg-graphite-800 p-7 transition-colors duration-200 hover:border-graphite-600 lg:min-h-[21rem] lg:p-8"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-copper text-graphite-900 transition-transform duration-300 group-hover:scale-110">
                <Icon aria-hidden="true" strokeWidth={1.75} className="size-7" />
              </span>
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-xl leading-tight font-semibold tracking-[-0.02em] lg:text-2xl">{title}</h3>
                <p className="text-silver">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

export function Models() {
  return (
    <section aria-labelledby="models-title" className="pt-20 lg:pt-28">
      <Container>
        <SectionHeading id="models-title" title="Модели в парке" />
        <div className="flex flex-col">
          {bikes.map((bike, i) => {
            const photo = bike.photos[0];
            const specs = [
              { label: "Запас хода", value: `${bike.specs.rangeKm} км` },
              { label: "Аккумулятор", value: `${bike.specs.voltage} В · ${bike.specs.batteryAh} А·ч` },
              { label: "Скорость", value: `${bike.specs.maxSpeedKmh} км/ч` },
            ];
            return (
              <Reveal key={bike.slug}>
                <article className="grid min-h-svh content-center items-center gap-7 border-b border-graphite-700 py-24 lg:grid-cols-2 lg:gap-16">
                  <div className={"cut overflow-hidden bg-graphite-800 " + (i % 2 === 1 ? "lg:order-2" : "")}>
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      sizes="(min-width: 1320px) 620px, (min-width: 1024px) 46vw, 100vw"
                      className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-5">
                    <h3 className="font-display text-[2rem] leading-none font-bold tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                      {bike.name}
                    </h3>
                    <p className="max-w-[46ch] text-lg text-silver lg:text-xl">{bike.summary}</p>
                    <dl className="grid grid-cols-3 border-y border-graphite-700 py-5">
                      {specs.map((s, k) => (
                        <div
                          key={s.label}
                          className={"flex min-w-0 flex-col gap-1 pr-2 " + (k > 0 ? "border-l border-graphite-700 pl-3 sm:pl-5" : "")}
                        >
                          <dt className="text-sm text-ash">{s.label}</dt>
                          <dd className="nums font-display text-base font-medium sm:text-xl lg:text-2xl">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="nums font-display text-2xl font-semibold tracking-[-0.02em] text-amber lg:text-3xl">
                      от {formatPrice(bike.rent.week)} в неделю
                    </p>
                    <div>
                      <ButtonLink href="/uslugi/arenda" variant="secondary" size="lg" className="w-full sm:w-auto">
                        Условия аренды
                      </ButtonLink>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

const steps = [
  "Оставляете заявку или звоните",
  "Приезжаете с паспортом",
  "Подписываем договор, вносите залог и первый платёж",
  "Уезжаете на заряженном электровелосипеде",
];

export function Steps() {
  return (
    <section aria-labelledby="steps-title" className={sectionClass}>
      <Container>
        <SectionHeading id="steps-title" title="Как взять в аренду" />
        <Stagger as="ol" className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {steps.map((text, i) => (
            <StaggerItem key={text} className="flex flex-col gap-4 pt-6">
              <span aria-hidden="true" className="nums font-display text-6xl leading-none font-bold text-copper">
                {i + 1}
              </span>
              <p className="text-lg text-chalk">{text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

export function Gallery() {
  return (
    <section aria-labelledby="gallery-title" className={sectionClass}>
      <Container>
        <SectionHeading id="gallery-title" title="Фото и видео" />
      </Container>
      <div className="mt-10 overflow-hidden lg:mt-14">
        <MarqueeGallery photos={galleryPhotos} />
      </div>
      <Container>
        {galleryVideos.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {galleryVideos.map((v) => (
              <video
                key={v.src}
                controls
                preload="none"
                poster={v.poster}
                aria-label={v.title}
                className="aspect-video w-full rounded-[4px] bg-graphite-800"
              >
                <source src={v.src} type="video/mp4" />
              </video>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

export function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <section aria-labelledby="faq-title" className={sectionClass}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id="faq-title" title="Частые вопросы" />
        </div>
        <Reveal>
          <Accordion items={faq} />
        </Reveal>
      </Container>
    </section>
  );
}

export function LeadBand() {
  return (
    <section id="zayavka" aria-labelledby="lead-title" className="slats scroll-mt-24 py-20 lg:py-28">
      <Container className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <h2 id="lead-title" className="h2">
            Оставьте заявку, и мы подберём электровелосипед
          </h2>
          <p className="lead text-chalk">Перезвоним, уточним срок и модель и подготовим договор к вашему приезду.</p>
          <div className="flex flex-col gap-1">
            <a
              href={site.phoneHref}
              className="nums inline-flex min-h-11 items-center font-display text-2xl font-semibold hover:text-amber"
            >
              {site.phone}
            </a>
            <p className="text-chalk">{site.hours}</p>
          </div>
        </div>
        <Reveal className="relative z-10">
          <LeadForm kind="rent" />
        </Reveal>
      </Container>
    </section>
  );
}
