// Patient API Service
import apiClient from "./client";

export const patientService = {
  // Get all patients
  getAll: async () => {
    return apiClient.get("/patients");
  },

  // Get patient by ID
  getById: async (id) => {
    return apiClient.get(`/patients/${id}`);
  },

  // Create new patient
  create: async (patientData) => {
    return apiClient.post("/patients", patientData);
  },

  // Update patient
  update: async (id, patientData) => {
    return apiClient.put(`/patients/${id}`, patientData);
  },

  // Delete patient
  delete: async (id) => {
    return apiClient.delete(`/patients/${id}`);
  },

  // Get unscheduled patients
  getUnscheduled: async () => {
    return apiClient.get("/patients/unscheduled");
  },

  // Get scheduled patients
  getScheduled: async () => {
    return apiClient.get("/patients/scheduled");
  },

  // Schedule patient for triage
  scheduleForTriage: async (id) => {
    return apiClient.patch(`/patients/${id}/schedule`);
  },

  // Update patient vitals
  updateVitals: async (id, vitalsData) => {
    return apiClient.patch(`/patients/${id}/vitals`, vitalsData);
  },
};

export default patientService;
