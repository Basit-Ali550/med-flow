"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import PatientForm from "@/components/PatientForm/PatientForm";


export default function PatientRegistration() {
  const router = useRouter();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // For patient registration, we use the same API
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit registration');
      }

      toast.success("Registration submitted successfully!");
      
      setTimeout(() => {
        router.push("/patient/success");
      }, 1500);
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />

      {/* Header provided by Layout */}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-8 px-4">
        <PatientForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          showVitalSigns={false}
          submitLabel="Submit Registration"
        />
      </main>
    </div>
  );
}
