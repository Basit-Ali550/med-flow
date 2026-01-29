"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import PatientForm from "@/components/PatientForm/PatientForm";

export default function AddPatient() {
  const router = useRouter();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add patient');
      }

      toast.success(data.message || "Patient added successfully!");
      
      setTimeout(() => {
        router.push("/nurse/dashboard");
      }, 1500);
    } catch (error) {
      toast.error(error.message || "Failed to add patient. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/nurse/dashboard");
  };

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
          <h1 className="text-2xl font-semibold tracking-tight">Add Patient</h1>
          <p className="text-sm text-teal-100 mt-1 opacity-90">
            Please fill in all relevant medical information.
          </p>
        </div>
        <div className="w-20"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-6">
        <PatientForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          showVitalSigns={true}
          submitLabel="Confirm"
        />
      </main>
    </div>
  );
}
