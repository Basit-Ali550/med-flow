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

  const updatePatientStatus = async (patientId, newStatus) => {
    try {
      await patientsApi.patch(patientId, { status: newStatus });
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

  const updatePatient = async (patientId, data) => {
      try {
          await patientsApi.patch(patientId, data);
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
    updatePatientStatus,
    updatePatient, // Exporting the new function
    deletePatient
  };
}


