/** Адрес уточнён заказчиком 20.11.2026. Телефон предоставлен заказчиком. */
export const site = {
  name: "Ю-Вело",
  legalName: "ООО «Ю-ВЕЛО»",
  tagline: "Аренда, выкуп и ремонт электровелосипедов",
  url: "https://u-velo.vercel.app",
  inn: "4707064045",
  ogrn: "1264700009265",
  phone: "+7 (981) 535-22-02",
  phoneHref: "tel:+79815352202",
  avitoHref: "https://www.avito.ru/brands/20350e59e7474f3df92fa051a43b2e9c",
  email: "", // Не предоставлена
  address: "Санкт-Петербург, проспект Ветеранов, 202",
  mapsHref: "https://yandex.ru/maps/2/saint-petersburg/house/prospekt_veteranov_202/Z0kYdwdnTEwDQFtjfXRyd35gZw==/?ll=30.107619%2C59.836016&z=20.36",
  hours: "Ежедневно, 10:00–19:00",
  hoursShort: "10:00–19:00",
  telegram: "", // Не предоставлен
  whatsapp: "", // Не предоставлен

} as const;

export const nav = [
  { href: "/uslugi/arenda", label: "Аренда" },
  { href: "/uslugi/pokupka", label: "Выкуп" },
  { href: "/uslugi/remont", label: "Ремонт" },
  { href: "/o-kompanii", label: "О компании" },
  { href: "/kontakty", label: "Контакты" },
] as const;
