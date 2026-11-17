import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

type Entry = MetadataRoute.Sitemap[number];

// lastModified не указываем: с cacheComponents нельзя вызывать new Date() при сборке,
// а выдуманная постоянная дата только запутает поисковики.
const pages: { path: string; changeFrequency: Entry["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/uslugi/arenda", changeFrequency: "weekly", priority: 0.9 },
  { path: "/uslugi/pokupka", changeFrequency: "weekly", priority: 0.9 },
  { path: "/uslugi/remont", changeFrequency: "monthly", priority: 0.8 },
  { path: "/o-kompanii", changeFrequency: "monthly", priority: 0.6 },
  { path: "/kontakty", changeFrequency: "monthly", priority: 0.7 },
  { path: "/politika-konfidencialnosti", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, site.url).toString(),
    changeFrequency,
    priority,
  }));
}
