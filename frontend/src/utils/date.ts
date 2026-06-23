export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Rolling / Open';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Rolling / Open';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Returns an urgency level based on how close the deadline is.
 * 'critical' → less than 30 days
 * 'soon'     → 30–60 days
 * 'normal'   → more than 60 days
 * 'none'     → no deadline set
 */
export function getDeadlineUrgency(dateString: string | null | undefined): 'critical' | 'soon' | 'normal' | 'none' {
  if (!dateString) return 'none';
  const deadline = new Date(dateString);
  if (isNaN(deadline.getTime())) return 'none';

  const now = new Date();
  const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 30) return 'critical';
  if (daysUntil <= 60) return 'soon';
  return 'normal';
}
