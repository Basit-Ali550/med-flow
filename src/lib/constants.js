
export const TRIAGE_LEVELS = {
  CRITICAL: 'Critical',
  URGENT: 'Urgent',
  SEMI_URGENT: 'Semi-Urgent',
  NON_URGENT: 'Non-Urgent',
  PENDING: 'Pending',
};

export const TRIAGE_LEVEL_VALUES = Object.values(TRIAGE_LEVELS);

// Patient Statuses
export const PATIENT_STATUS = {
  WAITING: 'Waiting',
  TRIAGED: 'Triaged',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DISCHARGED: 'Discharged',
  TRANSFERRED: 'Transferred',
  CANCELLED: 'Cancelled',
};

export const PATIENT_STATUS_VALUES = Object.values(PATIENT_STATUS);

// Cookie Configuration
export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Departments
export const DEPARTMENTS = [
  'Emergency',
  'ICU',
  'General',
  'Pediatrics',
  'Surgery',
  'Cardiology',
  'Neurology',
  'Other',
];

// Gender Options
export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

// API Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Vital Signs Thresholds (for triage calculation)
export const VITAL_THRESHOLDS = {
  heartRate: {
    critical: { min: 50, max: 120 },
    warning: { min: 60, max: 100 },
  },
  bloodPressureSys: {
    critical: { min: 90, max: 180 },
    warning: { min: 100, max: 140 },
  },
  temperature: {
    critical: { min: 35, max: 40 },
    warning: { min: 36, max: 38 },
  },
  o2Saturation: {
    critical: 90,
    warning: 95,
  },
  painLevel: {
    high: 8,
    moderate: 5,
  },
};
