import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

/** Первый блок страницы услуги: единственный h1 и вводный абзац. */
export function ServiceIntro({ title, lead }: { title: string; lead: string }) {
  return (
    <Container className="pt-8 pb-10 lg:pt-12 lg:pb-14">
      <SectionHeading as="h1" title={title} lead={lead} />
    </Container>
  );
}
