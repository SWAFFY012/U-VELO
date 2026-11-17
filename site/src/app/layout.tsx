import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import { OrganizationJsonLd } from "@/components/pages/organization-json-ld";
import { MotionProvider } from "@/components/motion-provider";
import { PageTransition } from "@/components/page-transition";
import { Preloader, preloaderScript } from "@/components/preloader";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — аренда, выкуп и ремонт электровелосипедов`,
    template: `%s — ${site.name}`,
  },
  description:
    "Электровелосипеды в аренду на неделю и месяц, продажа и выкуп, ремонт и обслуживание. Выдаём по паспорту за 15 минут.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: site.name,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${onest.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />
        <Preloader />
        <PageTransition />
        <SmoothScroll />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-[6px] focus:bg-copper focus:px-4 focus:py-3 focus:font-semibold focus:text-graphite-900"
        >
          Перейти к содержанию
        </a>
        <MotionProvider>
          <SiteHeader />
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
          <SiteFooter />
        </MotionProvider>
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
