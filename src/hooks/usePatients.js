"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function usePatients() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/patients?limit=100&sortBy=registeredAt&sortOrder=desc');
      const data = await response.json();
      if (data.success) {
        setItems(data.data.patients || []);
      }
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
      await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      return true;
    } catch (error) {
      toast.error("Failed to update patient status");
      return false;
    }
  };

  const deletePatient = async (patientId) => {
    try {
      await fetch(`/api/patients/${patientId}`, { method: 'DELETE' });
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
