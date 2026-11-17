import { site } from "@/lib/site";

/** «10:00–22:00» из site.hoursShort -> «Mo-Su 10:00-22:00» в формате schema.org. */
const openingHours = `Mo-Su ${site.hoursShort.replace(/[–—]/g, "-")}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${site.url}/#organization`,
  name: site.name,
  legalName: site.legalName,
  description: site.tagline,
  url: site.url,
  telephone: site.phoneHref.replace(/^tel:/, ""),
  email: site.email,
  address: site.address,
  openingHours,
  geo: {
    "@type": "GeoCoordinates",
    latitude: site.mapCenter.lat,
    longitude: site.mapCenter.lon,
  },
};

/** Разметка schema.org для поисковиков: организация, адрес, часы и координаты. */
export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      // «<» экранируем, чтобы строка из данных не могла закрыть тег script.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
