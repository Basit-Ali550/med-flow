"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { patientsApi } from "@/lib/api";

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
      toast.error("Failed to load patients");
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
      toast.error("Failed to update patient status");
      return false;
    }
  };

  const deletePatient = async (patientId) => {
    try {
      await patientsApi.delete(patientId);
      setItems(prev => prev.filter(p => p._id !== patientId));
      toast.success("Patient deleted");
      return true;
    } catch (e) {
      toast.error("Could not delete");
      return false;
    }
  };

  return {
    items,
    setItems,
    isLoading,
    refreshPatients: fetchPatients,
    updatePatientStatus,
    deletePatient
  };
}

