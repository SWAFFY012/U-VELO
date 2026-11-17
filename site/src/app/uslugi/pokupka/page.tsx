import type { Metadata } from "next";
import { BikeCatalog } from "@/components/services/bike-catalog";
import { FormSection } from "@/components/services/form-section";
import { ServiceIntro } from "@/components/services/service-intro";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Выкуп электровелосипедов",
  description: "Strong 350Z и Wenbox U7 без АКБ: аренда с выкупом по 4 900 ₽ в неделю на 26 недель. Первый платёж при заключении договора, затем раз в неделю.",
  alternates: { canonical: "/uslugi/pokupka" },
};

export default function BuyPage() {
  return (
    <>
      <ServiceIntro
        title={"Выкуп электро­велосипедов"}
        lead="Strong 350Z и Wenbox U7 без аккумулятора: 4 900 ₽ в неделю на 26 недель. Работаем напрямую по договору, без банков, кредитов и поручителей."
      />

      <BikeCatalog mode="buy" label="Модели для выкупа" />

      <section aria-labelledby="vykup-title">
        <Container className="grid gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-16 lg:py-24">
          <Reveal>
            <SectionHeading id="vykup-title" title="Выкуп из аренды" />
          </Reveal>
          <Reveal delay={0.08} className="flex flex-col items-start gap-7 lg:pt-6">
            <p className="max-w-[58ch] text-silver">
              Первый платёж вносится при заключении договора, затем — один платёж в неделю.
              После всех 26 платежей электровелосипед переходит в вашу собственность.
              По графику это 127 400 ₽. Аккумулятор в эту комплектацию не входит.
              Для Wenbox U7 требуется паспорт РФ с регистрацией в Санкт-Петербурге.
              Полный список требований указан в карточке каждой модели.
            </p>
            <ButtonLink href="/uslugi/arenda" variant="secondary">
              Посмотреть условия аренды
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      <FormSection
        kind="buy"
        title="Заявка на выкуп"
        text="Выберите модель и оставьте телефон. Проверим наличие, расскажем о требованиях и согласуем оформление договора."
      />
    </>
  );
}
