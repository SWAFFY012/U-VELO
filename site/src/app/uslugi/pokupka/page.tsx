import type { Metadata } from "next";
import { BikeCatalog } from "@/components/services/bike-catalog";
import { FormSection } from "@/components/services/form-section";
import { ServiceIntro } from "@/components/services/service-intro";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { bikes } from "@/data/bikes";
import { formatPrice } from "@/lib/format";

const minSalePrice = Math.min(...bikes.map((bike) => bike.sale.price));

export const metadata: Metadata = {
  title: "Покупка электровелосипедов",
  description: `Электровелосипеды в продаже от ${formatPrice(minSalePrice)}: цены, характеристики и наличие. Арендованный электровелосипед можно выкупить.`,
  alternates: { canonical: "/uslugi/pokupka" },
};

export default function BuyPage() {
  return (
    <>
      <ServiceIntro
        title={"Покупка электро­велосипедов"}
        lead="Те же модели, что и в аренде, можно купить сразу. Арендованный электровелосипед тоже можно выкупить."
      />

      <BikeCatalog mode="buy" label="Модели в продаже" />

      <section aria-labelledby="vykup-title">
        <Container className="grid gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-16 lg:py-24">
          <Reveal>
            <SectionHeading id="vykup-title" title="Выкуп из аренды" />
          </Reveal>
          <Reveal delay={0.08} className="flex flex-col items-start gap-7 lg:pt-6">
            <p className="max-w-[58ch] text-silver">
              Сначала берёте электровелосипед в аренду и ездите как обычно. Если решите оставить его себе,
              часть внесённых платежей пойдёт в счёт цены. Сколько останется доплатить, посчитаем, когда
              оставите заявку или позвоните.
            </p>
            <ButtonLink href="/uslugi/arenda" variant="secondary">
              Посмотреть условия аренды
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      <FormSection
        kind="buy"
        title="Заявка на покупку"
        text="Выберите модель и оставьте телефон. Перезвоним, расскажем о наличии и договоримся, когда можно приехать и посмотреть."
      />
    </>
  );
}
