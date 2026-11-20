import { Logo } from "@/components/ui/logo";

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
          {/* Геометрический контур знака исключает свечение из линий чертежа. */}
          <g fill="none" stroke="#ffb458" strokeWidth="2" strokeLinejoin="miter">
            <path d="M54 32H96V104L151 104L126 129H241L96 169V232H54Z" />
            <path d="M128 88A108 108 0 1 1 128 180L158 166A76 76 0 1 0 158 102Z" />
          </g>
          {/* Чистые контуры надписи той же толщины, что и знак. */}
          <g transform="translate(15 0) scale(0.96 1)" fill="none" stroke="#ffb458" strokeWidth="2" strokeLinejoin="round">
            <path d="M372 62H393V95H409C414 70 430 60 455 60C487 60 506 77 506 106C506 135 487 152 455 152C430 152 414 140 409 116H393V150H372Z" />
            <ellipse cx="455" cy="106" rx="29" ry="26" />
            <path d="M520 98H553V115H520Z" />
            <path d="M570 62H625C649 62 662 70 662 86C662 96 657 102 647 106C660 109 667 117 667 128C667 144 652 151 627 151H570Z
                     M591 79V97H623C634 97 640 94 640 88C640 82 634 79 623 79Z
                     M591 114V134H626C639 134 645 131 645 124C645 117 639 114 626 114Z" />
            <path d="M758 122H696C699 133 707 137 720 137C731 137 739 134 746 128L758 140C747 149 735 153 720 153C692 153 675 139 675 116C675 93 692 79 718 79C744 79 759 94 759 116Z
                     M697 106H737C734 97 728 94 718 94C707 94 700 98 697 106Z" />
            <path d="M770 151L794 83H839V151H818V101H809L792 151Z" />
            <path d="M851 116C851 93 867 79 891 79C915 79 929 93 929 116C929 139 914 153 891 153C867 153 851 139 851 116Z
                     M872 116C872 131 878 137 891 137C903 137 909 130 909 116C909 102 903 95 891 95C878 95 872 102 872 116Z" />
          </g>
        </svg>
        <Logo className="preloader__logo" eager decorative />
      </div>
      <span className="preloader__line" />
    </div>
  );
}
