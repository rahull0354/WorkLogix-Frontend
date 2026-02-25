import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function formatDate(
  dateString: string,
  formatString: string = "MMM dd, yyyy",
): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid Date";
    return format(date, formatString);
  } catch (error) {
    return "Invalid Date";
  }
}

export function formatDateTime(dateString: string): string {
  return formatDate(dateString, "MMM dd, yyyy 'at' h:mm a");
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid Date";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return "Invalid Date";
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

export function formatTime(seconds: number): string {
  if (!seconds || seconds < 0) return "00:00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
}

export function formatCurrency (
    amount: number,
    currency: string = 'USD'
): string {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency
        }).format(amount)
    } catch (error) {
        return `$${amount.toFixed(2)}`
    }
}

export function formatProjectStatus (
    status: 'active' | 'hold' | 'completed'
): string {
    return status.charAt(0).toUpperCase() + status.slice(1)
}

export function getStatusColor (
    status: 'active' | 'hold' | 'completed'
): string {
    switch (status) {
        case 'active':
            return 'badge-success';
        case 'hold':
            return 'badge-warning'
        case 'completed':
            return 'badge-info'
        default:
            return 'badge-neutral'
    }
}