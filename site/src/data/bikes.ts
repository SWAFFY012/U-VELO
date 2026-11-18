/**
 * Подтверждённые сведения из скриншотов объявлений Авито, переданных 17.11.2026.
 * null означает, что значение не опубликовано, а не нулевую цену или характеристику.
 * Расхождения и неподтверждённые параметры — в docs/avito-data.md.
 */
export interface BikePhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  description?: string;
}

export interface Bike {
  slug: "wenbox-u2" | "wenbox-u2-pro" | "strong-gs350" | "wenbox-u7";
  name: string;
  /** Короткое описание одной строкой. */
  summary: string;
  color: string;
  specs: {
    rangeKm: number | null;
    batteryAh: number | null;
    voltage: number | null;
    maxSpeedKmh: number | null;
    motorW: number | null;
    loadKg: number | null;
  };
  batteryNote?: string;
  specNote?: string;
  rent: { offered: boolean; day: number | null; week: number | null; month: number | null; deposit: number | null };
  buyoutOffered?: boolean;
  buyout?: { week: number; weeks: number; batteryIncluded: boolean; requirements: string[] };
  photos: BikePhoto[];
}

const photo = (file: string, alt: string, caption?: string): BikePhoto => ({
  src: `/photos/${file}.jpg`,
  alt,
  width: 1280,
  height: 960,
  caption,
});

export const bikes: Bike[] = [
  {
    slug: "wenbox-u2",
    name: "Wenbox U2",
    summary: "Рабочая лошадка для доставки: багажник, дисковые тормоза, яркая фара.",
    color: "Чёрный с оранжевым",
    specs: { rangeKm: null, batteryAh: null, voltage: null, maxSpeedKmh: null, motorW: null, loadKg: null },
    specNote: "Комплектацию и условия для Wenbox U2 уточняйте при обращении.",
    rent: { offered: true, day: null, week: null, month: null, deposit: null },
    photos: [
      photo("r5-01", "Wenbox U2, вид спереди", "Wenbox U2"),
      photo("r5-02", "Wenbox U2, вид сбоку"),
      photo("r5-03", "Wenbox U2, вид сзади сбоку"),
      photo("r5-04", "Wenbox U2, вид сзади"),
      photo("r5-05", "Wenbox U2: сиденье и багажник"),
      photo("r5-06", "Wenbox U2: переднее колесо и дисковый тормоз"),
      photo("r5-07", "Wenbox U2: светодиодная фара"),
      photo("r5-08", "Wenbox U2: дисплей на руле"),
    ],
  },
  {
    slug: "wenbox-u2-pro",
    name: "Wenbox U2 Pro",
    summary: "Широкое сиденье со спинкой и мягкая подвеска: удобно весь день в седле.",
    color: "Зелёный с оранжевым",
    specs: { rangeKm: 80, batteryAh: 45, voltage: 60, maxSpeedKmh: 60, motorW: null, loadKg: null },
    specNote: "Модель 2026 года. Один аккумулятор 60 В / 45 А·ч, вес 75 кг.",
    rent: { offered: true, day: 850, week: 4900, month: 18000, deposit: null },
    buyoutOffered: true,
    photos: [
      photo("u2pro-01", "Wenbox U2 Pro, вид спереди", "Wenbox U2 Pro"),
      photo("u2pro-02", "Wenbox U2 Pro на дорожке, вид спереди"),
      photo("u2pro-03", "Wenbox U2 Pro, вид сбоку"),
      photo("u2pro-04", "Wenbox U2 Pro, вид сбоку сзади"),
      photo("u2pro-05", "Wenbox U2 Pro, вид сзади"),
      photo("u2pro-06", "Wenbox U2 Pro: спинка и задний амортизатор"),
      photo("u2pro-07", "Wenbox U2 Pro: боковая панель"),
      photo("u2pro-08", "Wenbox U2 Pro: рама и подножка"),
      photo("u2pro-09", "Wenbox U2 Pro, вид сверху"),
      photo("u2pro-10", "Wenbox U2 Pro: сиденье со спинкой"),
      photo("u2pro-11", "Wenbox U2 Pro: руль и дисплей"),
    ],
  },
  {
    slug: "strong-gs350",
    name: "Strong 350Z",
    summary: "Электровелосипед для доставки: мотор 2 000 Вт, дисковые тормоза и широкие колёса. Выкуп без аккумулятора.",
    color: "Синий с оранжевым",
    specs: { rangeKm: 110, batteryAh: null, voltage: null, maxSpeedKmh: 80, motorW: 2000, loadKg: null },
    batteryNote: "Без АКБ",
    specNote: "Запас хода 90–110 км и скорость до 60–80 км/ч заявлены продавцом. Дальность зависит от используемой АКБ; аккумулятор в выкуп не входит.",
    rent: { offered: true, day: null, week: null, month: null, deposit: null },
    buyout: { week: 4900, weeks: 26, batteryIncluded: false, requirements: ["Паспорт РФ и гражданство Российской Федерации", "Отсутствие исполнительных производств и задолженностей у ФССП", "Отсутствие в чёрных списках продавца"] },
    photos: [
      photo("gs350-01", "Strong 350Z, вид спереди", "Strong 350Z"),
      photo("gs350-02", "Strong 350Z, вид сбоку"),
      photo("gs350-03", "Strong 350Z, вид сзади сбоку"),
      photo("gs350-04", "Strong 350Z, вид сзади"),
      photo("gs350-05", "Strong 350Z: боковая панель и колесо"),
      photo("gs350-06", "Strong 350Z: сиденье"),
      photo("gs350-07", "Strong 350Z: дисплей и руль"),
      photo("gs350-08", "Strong 350Z: замок зажигания и USB-разъём"),
    ],
  },
  {
    slug: "wenbox-u7",
    name: "Wenbox U7",
    summary: "Выкуп без аккумулятора: фиксированный платёж раз в неделю на 26 недель. После всех платежей велосипед становится вашим.",
    color: "Комплектация без АКБ",
    specs: { rangeKm: 110, batteryAh: null, voltage: null, maxSpeedKmh: 80, motorW: 2000, loadKg: null },
    batteryNote: "Без АКБ",
    specNote: "Заявлены мотор 2 000 Вт, скорость до 60–80 км/ч и запас хода 90–110 км с подходящей АКБ. Аккумулятор в выкуп не входит.",
    rent: { offered: false, day: null, week: null, month: null, deposit: null },
    buyout: { week: 4900, weeks: 26, batteryIncluded: false, requirements: ["Паспорт РФ с регистрацией в Санкт-Петербурге", "Гражданство Российской Федерации", "Отсутствие исполнительных производств и задолженностей у ФССП", "Отсутствие в чёрных списках продавца"] },
    photos: [],
  },
];

export const bikeBySlug = (slug: string) => bikes.find((b) => b.slug === slug);

/** Только подтверждённые тарифы, без подстановки цен выкупа в аренду. */
export const minRentWeek = Math.min(...bikes.flatMap((b) => b.rent.offered && b.rent.week !== null ? [b.rent.week] : []));
// Отсутствие подтверждённой цены не означает отсутствие модели в каталоге.
export const buyoutBikes = bikes.filter((b) => b.buyoutOffered || b.buyout);
export const rentBikes = bikes.filter((b) => b.rent.offered);

export const rentTerms = [
  { title: "Оформление", text: "Работаем официально по договору. Комплектацию, срок и условия согласуем до выдачи." },
  { title: "Стоимость", text: "Wenbox U2 Pro с одной АКБ 60 В / 45 А·ч: 850 ₽ за 1 день, 4 900 ₽ за 7 дней, 18 000 ₽ за 30 дней." },
  { title: "Поддержка", text: "Помогаем с техническими вопросами во время аренды. Перед каждой выдачей проверяем электровелосипед." },
  { title: "Выдача", text: "Санкт-Петербург, ул. Маршала Казакова, 29к2. При наличии техники выдача возможна в день обращения. Время визита согласуйте заранее." },
  { title: "Аренда с выкупом", text: "Strong 350Z и Wenbox U7 без АКБ: 4 900 ₽ в неделю, 26 недель. Первый платёж — при заключении договора, затем один платёж в неделю. Требования к документам зависят от модели." },
];

/** Не превращает отсутствующие данные в характеристики с нулевыми значениями. */
export function bikeSpecRows(bike: Bike) {
  const s = bike.specs;
  const rows: { label: string; value: string }[] = [];
  if (s.rangeKm !== null) rows.push({ label: "Запас хода", value: `до ${s.rangeKm} км` });
  if (bike.batteryNote) rows.push({ label: "Аккумулятор", value: bike.batteryNote });
  else if (s.voltage !== null && s.batteryAh !== null) rows.push({ label: "Аккумулятор", value: `${s.voltage} В · ${s.batteryAh} А·ч` });
  if (s.maxSpeedKmh !== null) rows.push({ label: "Скорость", value: `до ${s.maxSpeedKmh} км/ч` });
  if (s.motorW !== null) rows.push({ label: "Мотор", value: `${s.motorW.toLocaleString("ru-RU")} Вт` });
  if (s.loadKg !== null) rows.push({ label: "Нагрузка", value: `до ${s.loadKg} кг` });
  return rows.length ? rows : [{ label: "Комплектация", value: "По запросу" }];
}
