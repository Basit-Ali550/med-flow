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
 * Format wait time (e.g., "5m", "2h 30m", "1d")
 */
export function formatWaitTime(registeredAt) {
  if (!registeredAt) return "0m";

  const mins = getWaitTimeMinutes(registeredAt);

  if (mins < 60) {
    return `${mins}m`;
  } else if (mins < 1440) {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hours}h ${m}m`;
  } else {
    const days = Math.floor(mins / 1440);
    return `${days}d`;
  }
}

/**
 * Convert Celsius to Fahrenheit and format to 1 decimal
 */
export function cToF(celsius) {
  if (!celsius && celsius !== 0) return "";
  const val = Number(celsius);
  if (isNaN(val)) return "";
  return ((val * 9) / 5 + 32).toFixed(1);
}

export function isVitalAbnormal(type, value) {
  if (value === undefined || value === null || value === "") return false;
  const num = Number(value);
  if (isNaN(num)) return false;

  switch (type) {
    case 'bloodPressureSys':
      return num < 90 || num > 140;
    case 'bloodPressureDia':
      return num < 60 || num > 90;
    case 'heartRate':
      return num < 60 || num > 100;
    case 'o2Saturation':
      return num < 95;
    case 'temperature': {
      // Value is stored in Celsius, check range in Fahrenheit (97.0 - 99.5)
      // 97 F = 36.11 C, 99.5 F = 37.5 C
      const f = (num * 9) / 5 + 32;
      return f < 97.0 || f > 99.5;
    }
    default: return false;
  }
}
