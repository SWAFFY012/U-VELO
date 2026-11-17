/**
 * Страница «О компании».
 * PLACEHOLDER: тексты и цифры вымышленные, уточнить у заказчика
 */
import { formatPrice } from "@/lib/format";
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
const minDeposit = Math.min(...bikes.map((bike) => bike.rent.deposit));
const minRangeKm = Math.min(...bikes.map((bike) => bike.specs.rangeKm));
const minLoadKg = Math.min(...bikes.map((bike) => bike.specs.loadKg));

/** PLACEHOLDER: сколько минут занимает оформление аренды. */
const CHECKOUT_MINUTES = 15;

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
    "Ю-Вело сдаёт в аренду, продаёт и ремонтирует электровелосипеды для курьеров и поездок по городу. Как мы работаем: договор, залог, обслуживание и график.",

  lead:
    "Сдаём электровелосипеды в аренду, продаём их и ремонтируем. К нам приходят курьеры, которым нужен транспорт для работы, и горожане, которым удобнее ездить по городу без машины.",

  intro: {
    title: "Небольшой парк, который мы хорошо знаем",
    paragraphs: [
      `В парке ${bikes.length} ${plural(bikes.length, ["модель", "модели", "моделей"])}: ${modelNames}. Мы сами обслуживаем каждую и знаем, сколько она проезжает на одном заряде и что в ней изнашивается первым.`,
      "Электровелосипед можно взять на неделю, на месяц или выкупить. Если что-то сломалось, чиним в своей мастерской, а на время ремонта выдаём замену.",
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
      label: `${plural(bikes.length, ["модель", "модели", "моделей"])} в парке`,
    },
    { value: String(CHECKOUT_MINUTES), label: "минут на оформление аренды" },
    { value: "7", label: "дней в неделю работаем" },
    { value: "1", label: "неделя — минимальный срок аренды" },
  ] satisfies AboutFact[],

  termsLead:
    "Коротко о том, что стоит знать до того, как вы приедете за электровелосипедом.",

  terms: [
    {
      title: "Договор",
      text: "Заключаем договор аренды или купли-продажи. Для оформления нужен паспорт. Срок, цена и залог записаны в договоре.",
    },
    {
      title: "Залог",
      text: `От ${formatPrice(minDeposit)}. Возвращаем в день, когда вы сдаёте электровелосипед.`,
    },
    {
      title: "Обслуживание",
      text: "Плановое обслуживание входит в аренду. На время ремонта выдаём другой электровелосипед.",
    },
    {
      title: "График",
      text: `${site.hours}. Продлить аренду можно по телефону или в мессенджере, приезжать для этого не нужно.`,
    },
  ] satisfies AboutTerm[],

  reasons: [
    {
      id: "speed",
      title: "Быстрая выдача",
      text: `Оформление занимает около ${CHECKOUT_MINUTES} минут: паспорт, договор, залог — и можно ехать.`,
    },
    {
      id: "fleet",
      title: "Техника для работы",
      text: `Запас хода от ${minRangeKm} км и нагрузка от ${minLoadKg} кг: хватает на смену с заказами.`,
    },
    {
      id: "service",
      title: "Своя мастерская",
      text: "Обслуживаем и чиним электровелосипеды сами, поэтому знаем состояние каждого.",
    },
    {
      id: "buyout",
      title: "Можно выкупить",
      text: "Понравился арендованный электровелосипед — выкупайте: часть платежей идёт в счёт цены.",
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
    text: "В каталоге есть цены за неделю и за месяц. Если не знаете, какая модель подойдёт, напишите нам — поможем выбрать.",
  },
};
