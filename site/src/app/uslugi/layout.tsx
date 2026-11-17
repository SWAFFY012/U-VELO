import { ServiceTabs } from "@/components/services/service-tabs";
import { Container } from "@/components/ui/container";

/** Общий каркас страниц «Аренда», «Покупка» и «Ремонт»: вкладки и содержимое под ними. */
export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Container className="pt-28 lg:pt-32">
        <ServiceTabs />
      </Container>
      {children}
    </>
  );
}
