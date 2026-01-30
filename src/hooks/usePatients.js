"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { patientsApi } from "@/lib/api";
import { handleClientError } from "@/lib/error-handler";

export function usePatients() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await patientsApi.getAll({
        limit: 100,
        sortBy: 'registeredAt',
        sortOrder: 'desc'
      });

      setItems(data.data.patients || []);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const updatePatient = async (patientId, updates) => {
    try {
      // Support both string (legacy status update) and object (full patch)
      const payload = typeof updates === 'string' ? { status: updates } : updates;
      await patientsApi.patch(patientId, payload);
      return true;
    } catch (error) {
      handleClientError(error);
      return false;
    }
  };

  const deletePatient = async (patientId) => {
    try {
      await patientsApi.delete(patientId);
      setItems(prev => prev.filter(p => p._id !== patientId));
      toast.success("Patient deleted");
      return true;
    } catch (error) {
      handleClientError(error);
      return false;
    }
  };

  return {
    items,
    setItems,
    isLoading,
    refreshPatients: fetchPatients,
    updatePatientStatus: updatePatient, // Legacy alias
    updatePatient, // New flexible function
    deletePatient
  };
}
