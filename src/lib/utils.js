import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 'N/A';
  const diff = Date.now() - new Date(dateOfBirth).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

/**
 * Get wait time in minutes
 */
export function getWaitTimeMinutes(registeredAt) {
  if (!registeredAt) return 0;
  return Math.floor((Date.now() - new Date(registeredAt).getTime()) / 60000);
}

/**
 * Format wait time (e.g., "5m", "2h", "1d")
 */
export function formatWaitTime(registeredAt) {
  if (!registeredAt) return "0m";
  
  const mins = getWaitTimeMinutes(registeredAt);

  if (mins < 60) {
    return `${mins}m`;
  } else if (mins < 1440) {
    const hours = Math.floor(mins / 60);
    return `${hours}h`;
  } else {
    const days = Math.floor(mins / 1440);
    return `${days}d`;
  }
}

