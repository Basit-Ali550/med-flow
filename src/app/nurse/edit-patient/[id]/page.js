"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import PatientForm from "@/components/PatientForm/PatientForm";
import { Loader2 } from "lucide-react";

export default function EditPatient() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState(null);

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch patient");
        }

        const patient = data.data.patient;

        // Transform API data to Formik (flat) structure
        const formattedValues = {
          fullName: patient.fullName || "",
          dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : "",
          gender: patient.gender || "",
          symptoms: patient.symptoms || "",
          painLevel: patient.painLevel || 0,
          allergies: patient.allergies || "",
          medications: patient.medications || "",
          chronicConditions: patient.chronicConditions || "",
          // Flatten Vitals
          heartRate: patient.vitalSigns?.heartRate || "",
          bloodPressureSys: patient.vitalSigns?.bloodPressureSys || "",
          bloodPressureDia: patient.vitalSigns?.bloodPressureDia || "",
          temperature: patient.vitalSigns?.temperature || "",
          o2Saturation: patient.vitalSigns?.o2Saturation || "",
        };

        setInitialValues(formattedValues);
      } catch (error) {
        toast.error("Error loading patient data");
        router.push("/nurse/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatient();
    }
  }, [id, router]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
    
      const payload = {
        ...values,
        vitalSigns: {
          heartRate: values.heartRate,
          bloodPressureSys: values.bloodPressureSys,
          bloodPressureDia: values.bloodPressureDia,
          temperature: values.temperature,
          o2Saturation: values.o2Saturation,
        }
      };

      const response = await fetch(`/api/patients/${id}`, {
        method: 'PUT', // or PATCH
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update patient');
      }

      toast.success("Patient updated successfully!");
      
      setTimeout(() => {
        router.push("/nurse/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/nurse/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" richColors />

      {/* Header provided by Layout */}

      {/* Main Content */}
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
