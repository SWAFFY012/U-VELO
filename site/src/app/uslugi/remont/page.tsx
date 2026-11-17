import type { Metadata } from "next";
import { FormSection } from "@/components/services/form-section";
import { RepairTable } from "@/components/services/repair-table";
import { ServiceIntro } from "@/components/services/service-intro";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { repairGroups } from "@/data/repair";

export const metadata: Metadata = {
  title: "Ремонт и обслуживание электровелосипедов",
  description: "Ремонт электровелосипедов: электрика, ходовая, тормоза. Стоимость и срок согласуем после диагностики до начала работ.",
  alternates: { canonical: "/uslugi/remont" },
};

/** Шаги идут по порядку, поэтому здесь нумерация уместна. */
const steps = [
  {
    title: "Привозите электровелосипед",
    text: "Оставьте заявку или напишите нам, договоримся о времени. Берём электровелосипеды любых марок.",
  },
  {
    title: "Диагностика и цена",
    text: "Проверяем электрику и ходовую, находим причину. Называем цену и срок до начала работ.",
  },
  {
    title: "Ремонт и выдача",
    text: "Чиним после вашего согласия. Когда всё готово, звоним, и вы забираете электровелосипед.",
  },
];

export default function RepairPage() {
  return (
    <>
      <ServiceIntro
        title={"Ремонт и обслуживание электро­велосипедов"}
        lead="Чиним электровелосипеды любых марок. Сначала диагностика, потом называем цену — до начала работ."
      />

      <section aria-label="Цены на ремонт">
        <Container className="flex flex-col gap-12 pb-16 lg:gap-16 lg:pb-24">
          {repairGroups.map((group, index) => {
            const headingId = `remont-gruppa-${index + 1}`;
            const block = (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-16">
                {/* По смыслу это h2, а размер берём поменьше: длинные названия групп не помещаются в колонку. */}
                <h2 id={headingId} className="h3 lg:pt-3">
                  {group.title}
                </h2>
                <RepairTable group={group} />
              </div>
            );
            // Первая группа видна сразу после загрузки, поэтому появляется без анимации.
            return index === 0 ? (
              <div key={group.title}>{block}</div>
            ) : (
              <Reveal key={group.title}>{block}</Reveal>
            );
          })}
          <p className="max-w-[62ch] text-[0.9375rem] text-ash">
            Стоимость и срок согласуем после диагностики, до начала работ.
          </p>
        </Container>
      </section>

      <section aria-labelledby="kak-prohodit-title">
        <Container className="flex flex-col gap-10 py-16 lg:gap-14 lg:py-24">
          <Reveal>
            <SectionHeading id="kak-prohodit-title" title="Как проходит ремонт" />
          </Reveal>
          <Reveal delay={0.08}>
            <ol className="grid gap-x-10 gap-y-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-2 border-t border-graphite-700 pt-6 md:grid-cols-1 md:gap-y-4"
                >
                  <span aria-hidden="true" className="nums font-display text-2xl font-semibold text-copper">
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-2.5">
                    <h3 className="h3">{step.title}</h3>
                    <p className="max-w-[44ch] text-silver">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>

      <FormSection
        kind="repair"
        title="Заявка на ремонт"
        text="Опишите, что случилось. Перезвоним, подскажем примерную цену и срок и договоримся, когда привезти электровелосипед."
      />
    </>
  );
}
