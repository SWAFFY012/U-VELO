import { bikes, type BikePhoto } from "./bikes";

const pick = (slug: string, indexes: number[]): BikePhoto[] => {
  const bike = bikes.find((b) => b.slug === slug);
  return bike
    ? indexes.flatMap((i) => {
        const photo = bike.photos[i];
        return photo ? [{ ...photo, caption: bike.name, description: bike.summary }] : [];
      })
    : [];
};

/** Фото для галереи на главной. Первое — крупное. */
export const galleryPhotos: BikePhoto[] = [
  {
    src: "/photos/fleet-01.jpg",
    alt: "Четыре электровелосипеда Wenbox в помещении Ю-Вело",
    width: 1280,
    height: 960,
    caption: "Парк Ю-Вело",
    description: "Электровелосипеды Wenbox для аренды и покупки.",
  },
  ...pick("wenbox-u2-pro", [1, 3]),
  ...pick("wenbox-r5", [1, 6]),
  ...pick("strong-gs350", [0, 4]),
  {
    src: "/photos/fleet-02.jpg",
    alt: "Электровелосипеды Strong у точки выдачи",
    width: 1280,
    height: 960,
    caption: "У точки выдачи",
    description: "Электровелосипеды Strong из нашего парка.",
  },
  ...pick("wenbox-u2-pro", [10]),
];

/**
 * Видео для галереи (до 3 по договору). Пока роликов нет — блок не выводится.
 * Формат: { title, src: "/video/файл.mp4", poster: "/photos/файл.jpg" }.
 */
export const galleryVideos: { title: string; src: string; poster: string }[] = [];
