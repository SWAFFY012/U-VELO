import Link from "next/link";
import { nav, site } from "@/lib/site";
import { Container } from "./ui/container";
import { Logo } from "./ui/logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-graphite-700 bg-graphite-950">
      <Container className="grid gap-12 py-14 md:grid-cols-[1.3fr_1fr_1fr] lg:py-16">
        <div className="flex flex-col gap-5">
          <Link href="/" aria-label={`${site.name} — на главную`} className="self-start">
            <Logo className="h-24" />
          </Link>
          <p className="max-w-[34ch] text-silver">{site.tagline}.</p>
        </div>

        <nav aria-label="Разделы сайта">
          <h2 className="mb-4 text-sm font-medium text-ash">Разделы</h2>
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center text-chalk transition-colors duration-150 hover:text-amber"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-medium text-ash">Контакты</h2>
          <address className="flex flex-col not-italic">
            <a
              href={site.phoneHref}
              className="nums flex min-h-11 items-center font-semibold text-chalk transition-colors duration-150 hover:text-amber"
            >
              {site.phone}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex min-h-11 items-center text-chalk transition-colors duration-150 hover:text-amber"
            >
              {site.email}
            </a>
            <span className="mt-2 text-silver">{site.address}</span>
            <span className="mt-1 text-silver">{site.hours}</span>
          </address>
        </div>
      </Container>

      <div className="border-t border-graphite-800">
        <Container className="flex flex-col gap-3 py-6 text-sm text-ash md:flex-row md:items-center md:justify-between">
          <p className="nums">
            {site.legalName} · ИНН {site.inn} · ОГРН {site.ogrn}
          </p>
          <Link
            href="/politika-konfidencialnosti"
            className="flex min-h-11 items-center underline decoration-graphite-600 underline-offset-4 transition-colors duration-150 hover:text-chalk"
          >
            Политика обработки персональных данных
          </Link>
        </Container>
      </div>
    </footer>
  );
}
