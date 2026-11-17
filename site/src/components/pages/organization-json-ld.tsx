import { site } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${site.url}/#organization`,
  name: site.name,
  legalName: site.legalName,
  description: site.tagline,
  url: site.url,
  address: site.address,
};

/** Разметка schema.org для поисковиков: организация и подтверждённый адрес. */
export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      // «<» экранируем, чтобы строка из данных не могла закрыть тег script.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
