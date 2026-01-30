"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PatientForm from "@/components/PatientForm/PatientForm";
import { patientsApi } from "@/lib/api";
import { handleClientError } from "@/lib/error-handler";

export default function AddPatient() {
  const router = useRouter();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const data = await patientsApi.create(values);
      toast.success(data.message || "Patient added successfully!");
      setTimeout(() => router.push("/nurse/dashboard"), 1500);
    } catch (error) {
      handleClientError(error);
    } finally {
      setSubmitting(false);
    }
  };


  const handleCancel = () => router.push("/nurse/dashboard");

  return (
    <div className="min-h-screen bg-gray-100">
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

