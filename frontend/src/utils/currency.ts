export function formatCurrency(amount: number | null | undefined, currencyCode: string = 'USD'): string {
  if (amount == null) return 'Varies';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(amount);
}
