import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send, type LucideIcon } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { YandexMap, yandexMapsHref } from "@/components/pages/yandex-map";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакты",
  description: `Адрес точки выдачи ${site.name}, график работы, телефон, Telegram и WhatsApp. Напишите нам через форму — перезвоним.`,
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
      <section aria-labelledby="contacts-title">
        <Container className="pt-32 pb-16 lg:pt-40 lg:pb-24">
          <SectionHeading
            as="h1"
            id="contacts-title"
            title="Контакты"
            lead="Позвоните, напишите в мессенджер или приезжайте на точку выдачи."
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
                  <a
                    href={site.phoneHref}
                    className="nums inline-flex min-h-11 items-center text-xl font-semibold text-chalk transition-colors duration-150 hover:text-amber"
                  >
                    {site.phone}
                  </a>
                </Row>
                <Row icon={Mail} label="Почта">
                  <a href={`mailto:${site.email}`} className={`${linkClass} break-all`}>
                    {site.email}
                  </a>
                </Row>
              </dl>

              <p className="mt-8 text-[0.9375rem] text-ash">Мессенджеры</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <ButtonLink
                  href={site.telegram}
                  variant="secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send aria-hidden="true" strokeWidth={1.75} className="size-[1.125rem]" />
                  Telegram
                  {newTabHint}
                </ButtonLink>
                <ButtonLink
                  href={site.whatsapp}
                  variant="secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden="true" strokeWidth={1.75} className="size-[1.125rem]" />
                  WhatsApp
                  {newTabHint}
                </ButtonLink>
              </div>
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

      <section aria-labelledby="contacts-form-title" className="slats">
        <Container className="grid items-start gap-10 py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-24">
          <SectionHeading
            id="contacts-form-title"
            title="Напишите нам"
            lead="Оставьте имя и телефон. Перезвоним и ответим на вопрос об аренде, покупке или ремонте."
          />
          <Reveal>
            <LeadForm kind="contact" />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
