export function formatCurrency(amount: number | null | undefined, currencyCode: string = 'USD'): string {
  if (amount == null) return 'Varies';
  
  // Clean the currency code and fallback if it's invalid
  const cleanCurrency = (currencyCode || 'USD').trim().toUpperCase();
  
  try {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: cleanCurrency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    // If currency code is invalid (e.g. scraped "Euro" instead of "EUR"), fallback to string concat
    return `${cleanCurrency} ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
}
