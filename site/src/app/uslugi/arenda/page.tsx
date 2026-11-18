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
  description: `Wenbox U2 Pro с АКБ 60 В / 45 А·ч: 850 ₽ за день, ${formatPrice(minRentWeek)} за 7 дней, 18 000 ₽ за 30 дней. Санкт-Петербург, ул. Маршала Казакова, 29к2.`,
  alternates: { canonical: "/uslugi/arenda" },
};

export default function RentPage() {
  return (
    <>
      {/* Мягкий перенос в длинном слове: на узком экране заголовок делится по слогу, а не посреди слова. */}
      <ServiceIntro
        title={"Аренда электро­велосипедов"}
        lead="Выберите Wenbox U2, Wenbox U2 Pro или Strong 350Z. Для U2 Pro с АКБ доступны тарифы на 1, 7 и 30 дней. Условия аренды остальных моделей уточним при обращении."
      />

      <BikeCatalog mode="rent" label="Модели в аренду" />

      <section aria-labelledby="usloviya-title">
        <Container className="grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-16 lg:py-24">
          <Reveal>
            <SectionHeading id="usloviya-title" title="Условия аренды" />
          </Reveal>
          <Reveal delay={0.08}>
            <dl className="divide-y divide-graphite-700 border-y border-graphite-700">
              {rentTerms.map((term, index) => (
                <div
                  key={term.title}
                  className="grid gap-1.5 py-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8"
                >
                  <dt className="flex items-center gap-3 font-semibold text-chalk">
                    <span aria-hidden="true" className="nums flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-copper/30 bg-copper/10 font-display text-xl font-semibold text-copper">
                      {index + 1}
                    </span>
                    {term.title}
                  </dt>
                  <dd className="max-w-[58ch] pl-[3.25rem] text-silver sm:pl-0">{term.text}</dd>
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
