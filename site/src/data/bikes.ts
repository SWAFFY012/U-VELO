/**
 * Модели электровелосипедов.
 * PLACEHOLDER: цены, залог, характеристики и наличие вымышленные —
 * нужны только для вёрстки. Реальные данные возьмём с Авито.
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
  slug: "wenbox-r5" | "wenbox-u2-pro" | "strong-gs350";
  name: string;
  /** Короткое описание одной строкой. */
  summary: string;
  color: string;
  specs: {
    rangeKm: number;
    batteryAh: number;
    voltage: number;
    maxSpeedKmh: number;
    motorW: number;
    loadKg: number;
  };
  rent: { week: number; month: number; deposit: number };
  sale: { price: number; inStock: boolean; note?: string };
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
    slug: "wenbox-r5",
    name: "Wenbox R5",
    summary: "Рабочая лошадка для доставки: багажник, дисковые тормоза, яркая фара.",
    color: "Чёрный с оранжевым",
    specs: { rangeKm: 90, batteryAh: 30, voltage: 60, maxSpeedKmh: 45, motorW: 1000, loadKg: 150 },
    rent: { week: 4500, month: 15000, deposit: 5000 },
    sale: { price: 95000, inStock: true },
    photos: [
      photo("r5-01", "Wenbox R5, вид спереди", "Wenbox R5"),
      photo("r5-02", "Wenbox R5, вид сбоку"),
      photo("r5-03", "Wenbox R5, вид сзади сбоку"),
      photo("r5-04", "Wenbox R5, вид сзади"),
      photo("r5-05", "Wenbox R5: сиденье и багажник"),
      photo("r5-06", "Wenbox R5: переднее колесо и дисковый тормоз"),
      photo("r5-07", "Wenbox R5: светодиодная фара"),
      photo("r5-08", "Wenbox R5: дисплей на руле"),
    ],
  },
  {
    slug: "wenbox-u2-pro",
    name: "Wenbox U2 Pro",
    summary: "Широкое сиденье со спинкой и мягкая подвеска: удобно весь день в седле.",
    color: "Зелёный с оранжевым",
    specs: { rangeKm: 110, batteryAh: 35, voltage: 60, maxSpeedKmh: 50, motorW: 1200, loadKg: 180 },
    rent: { week: 5200, month: 17500, deposit: 5000 },
    sale: { price: 115000, inStock: true },
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
    name: "Strong GS350",
    summary: "Манёвренный и заметный в потоке. USB-зарядка для телефона под рукой.",
    color: "Синий с оранжевым",
    specs: { rangeKm: 80, batteryAh: 26, voltage: 60, maxSpeedKmh: 45, motorW: 800, loadKg: 150 },
    rent: { week: 4200, month: 14000, deposit: 5000 },
    sale: { price: 88000, inStock: false, note: "Под заказ, 5–7 дней" },
    photos: [
      photo("gs350-01", "Strong GS350, вид спереди", "Strong GS350"),
      photo("gs350-02", "Strong GS350, вид сбоку"),
      photo("gs350-03", "Strong GS350, вид сзади сбоку"),
      photo("gs350-04", "Strong GS350, вид сзади"),
      photo("gs350-05", "Strong GS350: боковая панель и колесо"),
      photo("gs350-06", "Strong GS350: сиденье"),
      photo("gs350-07", "Strong GS350: дисплей и руль"),
      photo("gs350-08", "Strong GS350: замок зажигания и USB-разъём"),
    ],
  },
];

export const bikeBySlug = (slug: string) => bikes.find((b) => b.slug === slug);

/** Минимальная цена аренды за неделю — для hero и метаописаний. */
export const minRentWeek = Math.min(...bikes.map((b) => b.rent.week));

/** PLACEHOLDER: условия аренды. */
export const rentTerms = [
  { title: "Документы", text: "Паспорт. Гражданам других стран — паспорт и миграционная карта." },
  { title: "Залог", text: "От 5 000 ₽, возвращаем в день сдачи электровелосипеда." },
  { title: "Срок", text: "От одной недели. Продлить можно по телефону или в мессенджере." },
  { title: "Обслуживание", text: "Плановое обслуживание и замена на время ремонта входят в аренду." },
  { title: "Выкуп", text: "Арендованный электровелосипед можно выкупить: часть платежей идёт в счёт цены." },
];
