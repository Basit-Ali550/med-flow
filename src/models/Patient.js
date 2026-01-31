import mongoose from 'mongoose';

const vitalSignsSchema = new mongoose.Schema(
  {
    heartRate: {
      type: Number,
      min: [0, 'Heart rate cannot be negative'],
      max: [300, 'Heart rate cannot exceed 300 BPM'],
    },
    bloodPressureSys: {
      type: Number,
      min: [0, 'Systolic BP cannot be negative'],
      max: [300, 'Systolic BP cannot exceed 300'],
    },
    bloodPressureDia: {
      type: Number,
      min: [0, 'Diastolic BP cannot be negative'],
      max: [200, 'Diastolic BP cannot exceed 200'],
    },
    temperature: {
      type: Number,
      min: [30, 'Temperature cannot be below 30°C'],
      max: [45, 'Temperature cannot exceed 45°C'],
    },
    o2Saturation: {
      type: Number,
      min: [0, 'O2 saturation cannot be negative'],
      max: [100, 'O2 saturation cannot exceed 100%'],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    // Personal Information
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: 'Date of birth cannot be in the future',
      },
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', ''],
      default: '',
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    address: {
      type: String,
      trim: true,
    },

    // Current Condition
    symptoms: {
      type: String,
      required: [true, 'Symptoms description is required'],
      minlength: [10, 'Please describe symptoms in detail (at least 10 characters)'],
    },
    painLevel: {
      type: Number,
      min: [0, 'Pain level cannot be negative'],
      max: [10, 'Pain level cannot exceed 10'],
      default: 0,
    },
    chiefComplaint: {
      type: String,
      trim: true,
    },

    // Medical History
    allergies: {
      type: String,
      trim: true,
      default: '',
    },
    medications: {
      type: String,
      trim: true,
      default: '',
    },
    chronicConditions: {
      type: String,
      trim: true,
      default: '',
    },
    medicalHistory: {
      type: String,
      trim: true,
    },

    // Lifestyle Information
    smokes: {
      type: String,
      enum: ['Yes', 'No', ''],
      default: '',
    },
    consumesAlcohol: {
      type: String,
      enum: ['Yes', 'No', ''],
      default: '',
    },
    takesOtherDrugs: {
      type: String,
      enum: ['Yes', 'No', ''],
      default: '',
    },
    otherDrugsDetails: {
      type: String,
      trim: true,
      default: '',
    },

    // Vital Signs
    vitalSigns: vitalSignsSchema,

    // Triage Information
    triageLevel: {
      type: String,
      enum: ['Critical', 'Urgent', 'Semi-Urgent', 'Non-Urgent', 'Pending'],
      default: 'Pending',
    },
    status: {
      type: String,
      enum: ['Waiting', 'Triaged', 'In Progress', 'Completed', 'Discharged', 'Transferred', 'Cancelled'],
      default: 'Waiting',
    },
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    estimatedWaitTime: {
      type: Number, // in minutes
      default: null,
    },
    
    // AI Analysis Data
    aiAnalysis: {
       score: Number,
       triageLevel: String,
       reasoning: String,
       recommendedActions: [String],
       timestamp: { type: Date, default: Date.now }
    },

    assignedNurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Nurse',
      default: null,
    },
    assignedDoctor: {
      type: String,
      trim: true,
    },

    // Timestamps
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    triageAt: {
      type: Date,
      default: null,
    },
    dischargedAt: {
      type: Date,
      default: null,
    },

    // Notes
    nurseNotes: {
      type: String,
      trim: true,
    },
    doctorNotes: {
      type: String,
      trim: true,
    },

    // Additional flags
    isEmergency: {
      type: Boolean,
      default: false,
    },
    requiresImmediate: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    manualOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

// Virtual for age calculation
patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for wait time calculation
patientSchema.virtual('currentWaitTime').get(function () {
  if (this.status !== 'Waiting' || !this.registeredAt) return null;
  const now = new Date();
  const registeredAt = new Date(this.registeredAt);
  return Math.floor((now - registeredAt) / (1000 * 60)); // Returns minutes
});

// Index for common queries
patientSchema.index({ status: 1, triageLevel: 1 });
patientSchema.index({ registeredAt: -1 });
patientSchema.index({ fullName: 'text' });

// Prevent model overwrite during hot reloads, but force refresh in dev if schema changed
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Patient;
}
const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

export default Patient;
