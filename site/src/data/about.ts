/**
 * Страница «О компании».
 * Согласовано с данными скриншотов объявлений Авито от 17.11.2026.
 */
import { site } from "@/lib/site";
import { bikes, type BikePhoto } from "./bikes";

/** 1 модель, 3 модели, 5 моделей. */
function plural(n: number, [one, few, many]: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** «A, B и C». */
function joinNames(names: string[]): string {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} и ${names[names.length - 1]}`;
}

const modelNames = joinNames(bikes.map((bike) => bike.name));
const CHECKOUT_MINUTES = 10;

export interface AboutFact {
  value: string;
  label: string;
}

export interface AboutTerm {
  title: string;
  text: string;
}

export interface AboutReason {
  id: "speed" | "fleet" | "service" | "buyout";
  title: string;
  text: string;
}

export const about = {
  metaDescription:
    "Ю-Вело сдаёт в аренду, продаёт и ремонтирует электровелосипеды для курьеров и поездок по городу. Как мы работаем: договор, комплектация, техническая поддержка и выкуп.",

  lead:
    "Сдаём электровелосипеды в аренду, продаём их и ремонтируем. К нам приходят курьеры, которым нужен транспорт для работы, и горожане, которым удобнее ездить по городу без машины.",

  intro: {
    title: "Транспорт для работы в доставке",
    paragraphs: [
      `В каталоге ${modelNames}. Для аренды доступен Wenbox U2 Pro с АКБ 60 В / 45 А·ч. Для выкупа — Strong 350Z и Wenbox U7 без аккумулятора. Условия Wenbox R5 уточняйте отдельно.`,
      "Работаем официально по договору. Проверяем технику перед выдачей и помогаем с техническими вопросами во время аренды. При наличии электровелосипед можно получить в день обращения.",
    ],
    photo: {
      src: "/photos/fleet-01.jpg",
      alt: "Четыре электровелосипеда Wenbox стоят в ряд в помещении Ю-Вело",
      width: 1280,
      height: 960,
    } satisfies BikePhoto,
  },

  facts: [
    {
      value: String(bikes.length),
      label: `${plural(bikes.length, ["модель", "модели", "моделей"])} в каталоге`,
    },
    { value: String(CHECKOUT_MINUTES), label: "минут на оформление выкупа" },
    { value: "7", label: "дней в неделю работаем" },
    { value: "26", label: "недель — срок выкупа без АКБ" },
  ] satisfies AboutFact[],

  termsLead:
    "Коротко о том, что стоит знать до того, как вы приедете за электровелосипедом.",

  terms: [
    {
      title: "Договор",
      text: "Заключаем договор аренды или аренды с выкупом. Требования к документам и комплектацию согласуем до оформления.",
    },
    {
      title: "Платежи по выкупу",
      text: "4 900 ₽ в неделю в течение 26 недель. Первый платёж — при заключении договора, далее раз в неделю.",
    },
    {
      title: "Обслуживание",
      text: "Помогаем с техническими вопросами во время аренды. Перед выдачей проверяем технику.",
    },
    {
      title: "График",
      text: `${site.hours}. Адрес: ${site.address}.`,
    },
  ] satisfies AboutTerm[],

  reasons: [
    {
      id: "speed",
      title: "Быстрая выдача",
      text: `Оформление выкупа занимает около ${CHECKOUT_MINUTES} минут. Требования к документам указаны в карточке модели.`,
    },
    {
      id: "fleet",
      title: "Техника для работы",
      text: "Wenbox U2 Pro: двойное сиденье, дополнительный багажник и одна АКБ 60 В / 45 А·ч. Заявленный запас хода — до 80 км.",
    },
    {
      id: "service",
      title: "Техническая поддержка",
      text: "Помогаем с техническими вопросами во время аренды. Проверяем электровелосипед перед выдачей.",
    },
    {
      id: "buyout",
      title: "Можно выкупить",
      text: "Strong 350Z и Wenbox U7 без АКБ: после всех 26 платежей велосипед переходит в вашу собственность.",
    },
  ] satisfies AboutReason[],

  reasonsPhoto: {
    src: "/photos/fleet-02.jpg",
    alt: "Пять электровелосипедов Strong стоят в ряд на улице у точки выдачи",
    width: 1280,
    height: 960,
  } satisfies BikePhoto,

  closing: {
    title: "Выберите модель или задайте вопрос",
    text: "В каталоге есть тарифы аренды на 1, 7 и 30 дней, а также график выкупа. Если не знаете, какая модель подойдёт, напишите нам — поможем выбрать.",
  },
};
