import texts from '../content/texts.json';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return currency.format(value);
}

export function formatCategory(value: string): string {
  const labels: Record<string, string> = texts.categories;
  return labels[value] ?? value;
}
