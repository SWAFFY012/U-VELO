import type { Metadata } from "next";
import { BikeCatalog } from "@/components/services/bike-catalog";
import { FormSection } from "@/components/services/form-section";
import { ServiceIntro } from "@/components/services/service-intro";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { minRentWeek, rentTerms } from "@/data/bikes";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Аренда электровелосипедов",
  description: `Электровелосипеды в аренду от ${formatPrice(minRentWeek)} в неделю. Срок от одной недели, плановое обслуживание входит в аренду. Цены за неделю и месяц, залог, условия.`,
  alternates: { canonical: "/uslugi/arenda" },
};

export default function RentPage() {
  return (
    <>
      {/* Мягкий перенос в длинном слове: на узком экране заголовок делится по слогу, а не посреди слова. */}
      <ServiceIntro
        title={"Аренда электро­велосипедов"}
        lead="Срок аренды — от одной недели. Плановое обслуживание и замена на время ремонта уже входят в цену."
      />

      <BikeCatalog mode="rent" label="Модели в аренду" />

      <section aria-labelledby="usloviya-title">
        <Container className="grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-16 lg:py-24">
          <Reveal>
            <SectionHeading id="usloviya-title" title="Условия аренды" />
          </Reveal>
          <Reveal delay={0.08}>
            <dl className="divide-y divide-graphite-700 border-y border-graphite-700">
              {rentTerms.map((term) => (
                <div
                  key={term.title}
                  className="grid gap-1.5 py-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8"
                >
                  <dt className="font-semibold text-chalk">{term.title}</dt>
                  <dd className="max-w-[58ch] text-silver">{term.text}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      <FormSection
        kind="rent"
        title="Заявка на аренду"
        text="Выберите модель и оставьте телефон. Перезвоним, ответим на вопросы и договоримся, когда вы заберёте электровелосипед."
      />
    </>
  );
}
