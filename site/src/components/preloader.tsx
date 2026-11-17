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
        <svg className="preloader__dims" viewBox="0 0 1172 847" fill="none">
          <g stroke="currentColor" strokeWidth="1.5">
            <path d="M40 -40H1132M40 -58V-22M1132 -58V-22" />
            <path d="M-48 30V820M-66 30H-30M-66 820H-30" />
            <path d="M586 -90V940" strokeDasharray="14 10" opacity=".55" />
            <path d="M-120 423H1290" strokeDasharray="14 10" opacity=".55" />
            <circle cx="790" cy="300" r="268" strokeDasharray="6 10" opacity=".5" />
            <circle cx="790" cy="300" r="150" strokeDasharray="6 10" opacity=".5" />
          </g>
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="preloader__sketch" src="/logo-sketch.png" alt="" width={1172} height={847} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="preloader__logo" src="/logo.png" alt="" width={1172} height={847} />
      </div>
      <span className="preloader__line" />
    </div>
  );
}
