/** Перечень работ для согласования. Подтверждённого прайса ремонта пока нет. */
export interface RepairService {
  name: string;
  priceFrom: number | null;
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
      { name: "Диагностика электрики и ходовой", priceFrom: null, term: "По диагностике" },
      { name: "Плановое техобслуживание", priceFrom: null, term: "По диагностике" },
      { name: "Подготовка к сезону", priceFrom: null, term: "По диагностике" },
    ],
  },
  {
    title: "Электрика",
    items: [
      { name: "Ремонт или замена контроллера", priceFrom: null, term: "По диагностике" },
      { name: "Диагностика и ремонт аккумулятора", priceFrom: null, term: "По диагностике" },
      { name: "Ремонт мотор-колеса", priceFrom: null, term: "По диагностике" },
      { name: "Замена проводки, фары, дисплея", priceFrom: null, term: "По диагностике" },
    ],
  },
  {
    title: "Ходовая и тормоза",
    items: [
      { name: "Замена тормозных колодок", priceFrom: null, term: "По диагностике" },
      { name: "Прокачка гидравлических тормозов", priceFrom: null, term: "По диагностике" },
      { name: "Замена покрышки или камеры", priceFrom: null, term: "По диагностике" },
      { name: "Ремонт амортизаторов и вилки", priceFrom: null, term: "По диагностике" },
    ],
  },
];
