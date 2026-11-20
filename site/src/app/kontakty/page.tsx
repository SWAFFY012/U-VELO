import type { Metadata } from "next";
import { Clock, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { YandexMap, yandexMapsHref } from "@/components/pages/yandex-map";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакты",
  description: `Адрес точки выдачи ${site.name}, условия визита и связь через Авито. Свяжитесь с нами, чтобы уточнить наличие и время визита.`,
  alternates: { canonical: "/kontakty" },
};

const linkClass =
  "inline-flex min-h-11 items-center text-chalk underline decoration-graphite-600 underline-offset-4 transition-colors duration-150 hover:text-amber";

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-5">
      <Icon aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-copper" />
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-[0.9375rem] text-ash">{label}</dt>
        <dd className="text-lg text-chalk">{children}</dd>
      </div>
    </div>
  );
}

const newTabHint = <span className="sr-only">, откроется в новой вкладке</span>;

export default function ContactsPage() {
  return (
    <>
      <section aria-labelledby="contacts-title" className="slats">
        <Container className="pt-32 pb-16 lg:pt-40 lg:pb-24">
          <SectionHeading
            as="h1"
            id="contacts-title"
            title="Контакты"
            lead="Свяжитесь с нами по вопросам аренды, выкупа или ремонта. Перед приездом согласуйте время визита."
          />

          <div className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <address className="not-italic">
              <dl className="divide-y divide-graphite-700 border-y border-graphite-700">
                <Row icon={MapPin} label="Адрес">
                  {site.address}
                </Row>
                <Row icon={Clock} label="График работы">
                  <span className="nums">{site.hours}</span>
                </Row>
                <Row icon={Phone} label="Телефон">
                  <span id="phone" className="nums text-xl font-semibold">+7 (___) ___-__-__</span>
                  <span className="block text-sm text-silver">Номер скоро появится. Пока напишите нам в Авито.</span>
                </Row>
                <Row icon={MessageCircle} label="Связь">
                  <a
                    href={site.phoneHref}
                    className="nums inline-flex min-h-11 items-center text-xl font-semibold text-chalk transition-colors duration-150 hover:text-amber"
                  >
                    {site.phone}
                  </a>
                </Row>

              </dl>

            </address>

            <div className="flex flex-col gap-2">
              <YandexMap />
              <a
                href={yandexMapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} self-start text-[0.9375rem]`}
              >
                Открыть в Яндекс Картах
                {newTabHint}
              </a>
            </div>
          </div>
        </Container>
      </section>


    </>
  );
}
