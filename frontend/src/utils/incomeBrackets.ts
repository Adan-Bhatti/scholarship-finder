export interface IncomeBracketOption {
  value: string;
  label: string;
}

export function getIncomeBracketsForCountry(countryName?: string): IncomeBracketOption[] {
  const normalizedCountry = (countryName || '').trim().toLowerCase();

  if (normalizedCountry === 'pakistan') {
    return [
      { value: 'Under 50,000 PKR / month', label: 'Under 50,000 PKR / month' },
      { value: '50,000 - 150,000 PKR / month', label: '50,000 - 150,000 PKR / month' },
      { value: '150,000 - 300,000 PKR / month', label: '150,000 - 300,000 PKR / month' },
      { value: 'Over 300,000 PKR / month', label: 'Over 300,000 PKR / month' }
    ];
  }

  if (normalizedCountry === 'united kingdom' || normalizedCountry === 'uk' || normalizedCountry === 'england' || normalizedCountry === 'great britain') {
    return [
      { value: 'Under £15,000 / year', label: 'Under £15,000 / year' },
      { value: '£15,000 - £30,000 / year', label: '£15,000 - £30,000 / year' },
      { value: '£30,000 - £60,000 / year', label: '£30,000 - £60,000 / year' },
      { value: 'Over £60,000 / year', label: 'Over £60,000 / year' }
    ];
  }

  if (
    normalizedCountry === 'germany' ||
    normalizedCountry === 'france' ||
    normalizedCountry === 'italy' ||
    normalizedCountry === 'spain' ||
    normalizedCountry === 'europe' ||
    normalizedCountry === 'netherlands' ||
    normalizedCountry === 'belgium'
  ) {
    return [
      { value: 'Under €20,000 / year', label: 'Under €20,000 / year' },
      { value: '€20,000 - €40,000 / year', label: '€20,000 - €40,000 / year' },
      { value: '€40,000 - €80,000 / year', label: '€40,000 - €80,000 / year' },
      { value: 'Over €80,000 / year', label: 'Over €80,000 / year' }
    ];
  }

  if (
    normalizedCountry === 'united states' ||
    normalizedCountry === 'usa' ||
    normalizedCountry === 'canada' ||
    normalizedCountry === 'us'
  ) {
    return [
      { value: 'Under $30,000 / year', label: 'Under $30,000 / year' },
      { value: '$30,000 - $60,000 / year', label: '$30,000 - $60,000 / year' },
      { value: '$60,000 - $100,000 / year', label: '$60,000 - $100,000 / year' },
      { value: 'Over $100,000 / year', label: 'Over $100,000 / year' }
    ];
  }

  // Generic / Default
  return [
    { value: 'Low Income', label: 'Low Income' },
    { value: 'Middle Income', label: 'Middle Income' },
    { value: 'High Income', label: 'High Income' }
  ];
}
