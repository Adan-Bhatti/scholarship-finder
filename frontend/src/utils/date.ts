export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Rolling / Varies';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Rolling / Varies';
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
