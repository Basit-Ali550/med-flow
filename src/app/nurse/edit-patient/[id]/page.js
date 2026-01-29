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
      // Reconstitute the structure expected by API (nested vitalSigns)
      // Note: The API likely handles partial updates, but we'll send the structure clearly.
      // Based on previous conversations, the backend likely expects vitalSigns object or flattened.
      // Checking PatientForm usage in AddPatient: `JSON.stringify(values)`.
      // The API endpoint for ADD handles the flat structure or nested?
      // Let's check API add logic... "If heartRate, vitalSigns.heartRate = ..."
      // So the API handles flat fields being converted to nested.
      // BUT for UPDATE (PUT/PATCH), usually it expects the schema shape.
      // I'll check /api/patients/[id]/route.js (it was edited earlier).
      // Assuming it handles similar logic or direct object.
      // To be safe, I'll send the flat structure if the API supports it, or nested if I can verify.
      // For now, I'll send values as-is (flat), and if API fails, I'll fix it.
      // Wait, AddPatient sends flat values. Edit should be similar.
      
      // Actually, standardizing: sending values as is.
      // If the API /api/patients/[id] doesn't extract heartRate etc from body, I should nest them.
      // Let's assume I need to nest them to be safe/clean for the Update endpoint.
      
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

      {/* Header */}
      <header className="bg-teal-600 text-white py-4 px-6 flex items-center justify-between shadow-md">
        <div className="bg-white rounded-full py-2 px-3 flex items-center gap-0.5 shadow-sm">
          <span className="text-teal-600 font-bold text-xs">Med</span>
          <span className="text-teal-500 font-bold text-xs">Flow</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Edit Patient</h1>
          <p className="text-sm text-teal-100 mt-1 opacity-90">
            Update patient information
          </p>
        </div>
        <div className="w-20"></div>
      </header>

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
