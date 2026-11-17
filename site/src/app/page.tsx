import { Hero } from "@/components/home/hero";
import { Advantages, Faq, Gallery, LeadBand, Models, Steps } from "@/components/home/sections";
import { bikes, minRentWeek } from "@/data/bikes";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export default function HomePage() {
  const maxRange = Math.max(...bikes.map((b) => b.specs.rangeKm));
  const photo = bikes[0].photos[0];

  return (
    <>
      <Hero
        lead={`Аренда от ${formatPrice(minRentWeek)} в неделю, выкуп и ремонт. Оформляем по паспорту и выдаём за 15 минут.`}
        photo={{ src: "/photos/r5-01.jpg", alt: "Электровелосипед Wenbox R5, чёрный с оранжевым", width: photo.width, height: photo.height }}
        stats={[
          { value: `от ${formatPrice(minRentWeek)}`, label: "за неделю аренды" },
          { value: "15 минут", label: "на оформление и выдачу" },
          { value: `до ${maxRange} км`, label: "на одном заряде" },
          { value: site.hoursShort, label: "ежедневно" },
        ]}
      />
      <Advantages />
      <Models />
      <Steps />
      <Gallery />
      <Faq />
      <LeadBand />
    </>
  );
}
