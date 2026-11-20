import { brandLogo, Logo } from "@/components/ui/logo";

/**
 * Загрузочный экран: чертёж логотипа «прорисовывается», затем превращается
 * в объёмный логотип, и экран уходит вверх. Около 3,5 секунды, при каждой загрузке сайта.
 *
 * Вся анимация на CSS (см. globals.css, блок «Загрузочный экран»), поэтому
 * экран уходит сам, даже если скрипты ещё не загрузились. Скрипт в <head>
 * ставит `data-preloader="seen"` при «уменьшить движение» — тогда экран не показывается.
 */
/** Через сколько секунд экран начинает уходить (сверяется с globals.css). */
export const PRELOADER_EXIT_S = 2.85;

export const preloaderScript = `try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.preloader="seen"}}catch(e){}`;

export function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader__grid" />
      <div className="preloader__stage">
        {/* Размерные линии чертежа */}
        <svg className="preloader__dims" viewBox="0 0 930 274" fill="none">
          <g stroke="currentColor" strokeWidth="1.5">
            <path d="M54 -36H906M54 -48V-24M906 -48V-24" />
            <path d="M-34 26V242M-46 26H-22M-46 242H-22" />
            <path d="M226 -72V346M-64 134H994" strokeDasharray="14 10" opacity=".55" />
            <circle cx="226" cy="134" r="118" strokeDasharray="6 10" opacity=".5" />
          </g>
        </svg>
        <svg className="preloader__sketch" viewBox="0 0 930 274">
          <defs>
            <clipPath id="preloader-wordmark">
              <rect x="360" y="0" width="570" height="274" />
            </clipPath>
            <filter id="preloader-logo-outline">
              <feMorphology in="SourceAlpha" operator="erode" radius="3" result="inside" />
              <feComposite in="SourceAlpha" in2="inside" operator="out" result="outline" />
              <feFlood floodColor="#ffb458" />
              <feComposite in2="outline" operator="in" />
            </filter>
          </defs>
          {/* Геометрический контур знака исключает свечение из линий чертежа. */}
          <g fill="none" stroke="#ffb458" strokeWidth="2" strokeLinejoin="miter">
            <path d="M54 32H96V104L151 104L126 129H241L96 169V232H54Z" />
            <path d="M128 88A108 108 0 1 1 128 180L158 166A76 76 0 1 0 158 102Z" />
          </g>
          <g clipPath="url(#preloader-wordmark)">
            <image href={brandLogo.src} width={brandLogo.width} height={brandLogo.height} filter="url(#preloader-logo-outline)" />
          </g>
        </svg>
        <Logo className="preloader__logo" eager decorative />
      </div>
      <span className="preloader__line" />
    </div>
  );
}
