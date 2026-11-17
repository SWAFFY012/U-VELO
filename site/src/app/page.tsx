import { Hero } from "@/components/home/hero";
import { Advantages, Faq, Gallery, LeadBand, Models, Steps } from "@/components/home/sections";
import { bikes, minRentWeek } from "@/data/bikes";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export default function HomePage() {
  const maxRange = Math.max(...bikes.flatMap((b) => b.specs.rangeKm === null ? [] : [b.specs.rangeKm]));
  const photo = bikes[0].photos[0];

  return (
    <>
      <Hero
        lead={`Аренда от ${formatPrice(minRentWeek)} в неделю, выкуп и ремонт. Работаем официально по договору.`}
        photo={{ src: "/photos/r5-01.jpg", alt: "Электровелосипед Wenbox R5, чёрный с оранжевым", width: photo.width, height: photo.height }}
        stats={[
          { value: `от ${formatPrice(minRentWeek)}`, label: "за неделю аренды" },
          { value: "10 минут", label: "на оформление выкупа" },
          { value: `до ${maxRange} км`, label: "заявленный запас хода" },
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
