import { permanentRedirect } from "next/navigation";

/** У раздела нет собственной страницы: открываем первую вкладку. */
export default function ServicesIndexPage() {
  permanentRedirect("/uslugi/arenda");
}
