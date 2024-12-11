/**
 * @param money El valor monetario a formatear
 * @param options Las opciones de formateo. La currency por defecto es 'ARS'
 * @param locale La locale utilizada para formatear la moneda
 * @returns string
 */

export const formatMoney = (
  money: number = 0,
  options?: Partial<Intl.NumberFormatOptions>,
  locale: string = "es-AR"
): string => {
  return new Intl.NumberFormat(locale === "es" ? "es-AR" : locale, {
    style: options?.style ?? "currency",
    currency: options?.currency ?? "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(money);
};

export const reduceByPercentage = (money: number, percentage: number) => {
  const reduction = money * (percentage / 100);
  const difference = money - reduction;
  const rounded = Math.round(difference);

  return rounded;
};
