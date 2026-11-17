/**
 * Общие сведения о компании.
 * PLACEHOLDER: адрес, телефон, мессенджеры, почта и координаты вымышленные.
 * Заменить на реальные до запуска. Реквизиты взяты из договора.
 */
export const site = {
  name: "Ю-Вело",
  legalName: "ООО «Ю-ВЕЛО»",
  tagline: "Аренда, выкуп и ремонт электровелосипедов",
  url: "https://u-velo.ru", // PLACEHOLDER: домен
  inn: "4707064045",
  ogrn: "1264700009265",
  phone: "+7 (900) 000-00-00", // PLACEHOLDER
  phoneHref: "tel:+79000000000", // PLACEHOLDER
  email: "hello@u-velo.ru", // PLACEHOLDER
  address: "Санкт-Петербург",
  hours: "Ежедневно, 10:00–22:00",
  hoursShort: "10:00–22:00",
  telegram: "https://t.me/", // PLACEHOLDER
  whatsapp: "https://wa.me/79000000000", // PLACEHOLDER
  /** PLACEHOLDER: координаты точки для Яндекс Карты (долгота, широта). */
  mapCenter: { lon: 30.3158, lat: 59.9391 },
} as const;

export const nav = [
  { href: "/uslugi/arenda", label: "Аренда" },
  { href: "/uslugi/pokupka", label: "Покупка" },
  { href: "/uslugi/remont", label: "Ремонт" },
  { href: "/o-kompanii", label: "О компании" },
  { href: "/kontakty", label: "Контакты" },
] as const;
