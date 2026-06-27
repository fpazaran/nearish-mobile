/**
 * Format an ISO date string to a human-readable format.
 * e.g. "2025-06-23" → "Jun 23, 2025"
 */
export function formatDate(iso: string): string {
  const date = new Date(iso + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date range for display.
 * e.g. "Jun 23 – Jun 30, 2025"
 */
export function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();

  if (sameMonth) {
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.getDate()}, ${e.getFullYear()}`;
  }
  if (sameYear) {
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${e.getFullYear()}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/**
 * Returns the number of days between today and the given ISO date string.
 * Positive = future, negative = past.
 */
export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get visit status label from start/end ISO strings.
 */
export function getVisitStatusLabel(
  state: 'planned' | 'unplanned' | 'active' | 'completed',
): string {
  switch (state) {
    case 'active':
      return 'Happening now ✨';
    case 'planned':
      return 'Upcoming';
    case 'completed':
      return 'Completed';
    default:
      return 'No visit planned';
  }
}

/**
 * Format a unix timestamp (seconds) as a relative time string.
 * e.g. "expires in 28 min"
 */
export function formatExpiry(expiresAt: number): string {
  const msLeft = expiresAt * 1000 - Date.now();
  if (msLeft <= 0) return 'Expired';
  const min = Math.ceil(msLeft / 60000);
  if (min < 60) return `Expires in ${min} min`;
  const hrs = Math.ceil(min / 60);
  return `Expires in ${hrs} hr`;
}
