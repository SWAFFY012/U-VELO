/** 4500 -> «4 500 ₽» (с неразрывными пробелами). */
export function formatPrice(value: number): string {
  return `${value.toLocaleString("ru-RU").replace(/\s/g, " ")} ₽`;
}
