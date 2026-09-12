const formatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

export function formatCurrency(amount: number): string {
  return formatter.format(amount);
}
