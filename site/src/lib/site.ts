/** Адрес подтверждён скриншотами Авито. Телефон, почта и мессенджеры не предоставлены. */
export const site = {
  name: "Ю-Вело",
  legalName: "ООО «Ю-ВЕЛО»",
  tagline: "Аренда, выкуп и ремонт электровелосипедов",
  url: "https://u-velo.vercel.app",
  inn: "4707064045",
  ogrn: "1264700009265",
  phone: "Связаться в Авито",
  phoneHref: "https://www.avito.ru/brands/20350e59e7474f3df92fa051a43b2e9c",
  email: "", // Не предоставлена
  address: "Санкт-Петербург, ул. Маршала Казакова, 29к2",
  hours: "Ежедневно, время визита согласуйте заранее",
  hoursShort: "По записи",
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
