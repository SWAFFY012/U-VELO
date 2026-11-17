/** PLACEHOLDER: перечень работ, цены «от» и сроки вымышленные. */
export interface RepairService {
  name: string;
  priceFrom: number;
  term: string;
}

export interface RepairGroup {
  title: string;
  items: RepairService[];
}

export const repairGroups: RepairGroup[] = [
  {
    title: "Диагностика и обслуживание",
    items: [
      { name: "Диагностика электрики и ходовой", priceFrom: 500, term: "30 минут" },
      { name: "Плановое техобслуживание", priceFrom: 1500, term: "1–2 часа" },
      { name: "Подготовка к сезону", priceFrom: 2500, term: "1 день" },
    ],
  },
  {
    title: "Электрика",
    items: [
      { name: "Ремонт или замена контроллера", priceFrom: 2000, term: "1–2 дня" },
      { name: "Диагностика и ремонт аккумулятора", priceFrom: 1500, term: "1–3 дня" },
      { name: "Ремонт мотор-колеса", priceFrom: 3000, term: "2–3 дня" },
      { name: "Замена проводки, фары, дисплея", priceFrom: 800, term: "от 1 часа" },
    ],
  },
  {
    title: "Ходовая и тормоза",
    items: [
      { name: "Замена тормозных колодок", priceFrom: 600, term: "30 минут" },
      { name: "Прокачка гидравлических тормозов", priceFrom: 1200, term: "1 час" },
      { name: "Замена покрышки или камеры", priceFrom: 700, term: "40 минут" },
      { name: "Ремонт амортизаторов и вилки", priceFrom: 1800, term: "1–2 дня" },
    ],
  },
];
