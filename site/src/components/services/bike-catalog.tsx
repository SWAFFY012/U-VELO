import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { bikes } from "@/data/bikes";
import { BikeRow, type CatalogMode } from "./bike-row";

/** Каталог моделей для страниц аренды и покупки. */
export function BikeCatalog({ mode, label }: { mode: CatalogMode; label: string }) {
  return (
    <section aria-label={label}>
      <Container className="flex flex-col gap-6 lg:gap-8">
        {bikes.map((bike, index) =>
          // Первая строка видна сразу после загрузки, поэтому появляется без анимации.
          index === 0 ? (
            <BikeRow key={bike.slug} bike={bike} mode={mode} eager />
          ) : (
            <Reveal key={bike.slug}>
              <BikeRow bike={bike} mode={mode} />
            </Reveal>
          ),
        )}
      </Container>
    </section>
  );
}
