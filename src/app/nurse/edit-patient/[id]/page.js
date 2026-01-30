"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import PatientForm from "@/components/PatientForm/PatientForm";
import { Loader2 } from "lucide-react";
import { patientsApi } from "@/lib/api";
import { handleClientError } from "@/lib/error-handler";

/**
 * Transform API patient data to flat form values
 */
function transformPatientToFormValues(patient) {
  return {
    fullName: patient.fullName || "",
    dateOfBirth: patient.dateOfBirth 
      ? new Date(patient.dateOfBirth).toISOString().split('T')[0] 
      : "",
    gender: patient.gender || "",
    symptoms: patient.symptoms || "",
    painLevel: patient.painLevel || 0,
    allergies: patient.allergies || "",
    medications: patient.medications || "",
    chronicConditions: patient.chronicConditions || "",
    heartRate: patient.vitalSigns?.heartRate || "",
    bloodPressureSys: patient.vitalSigns?.bloodPressureSys || "",
    bloodPressureDia: patient.vitalSigns?.bloodPressureDia || "",
    temperature: patient.vitalSigns?.temperature || "",
    o2Saturation: patient.vitalSigns?.o2Saturation || "",
  };
}

export default function EditPatient() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState(null);

  const fetchPatient = useCallback(async () => {
    try {
      const { data } = await patientsApi.getById(id);
      setInitialValues(transformPatientToFormValues(data.patient));
    } catch (error) {
      handleClientError(error);
      router.push("/nurse/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchPatient();
  }, [id, fetchPatient]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await patientsApi.update(id, values);
      toast.success("Patient updated successfully!");
      setTimeout(() => router.push("/nurse/dashboard"), 1000);
    } catch (error) {
      handleClientError(error);
    } finally {
      setSubmitting(false);
    }
  };


  const handleCancel = () => router.push("/nurse/dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-8 px-6">
        {initialValues && (
          <PatientForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            showVitalSigns={true}
            submitLabel="Update Patient"
          />
        )}
      </main>
    </div>
  );
}

