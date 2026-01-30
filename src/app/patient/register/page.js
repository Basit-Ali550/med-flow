"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PatientForm from "@/components/PatientForm/PatientForm";
import { patientsApi } from "@/lib/api";
import { handleClientError } from "@/lib/error-handler";

export default function PatientRegistration() {
  const router = useRouter();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await patientsApi.create(values);
      toast.success("Registration submitted successfully!");
      setTimeout(() => router.push("/patient/success"), 1500);
    } catch (error) {
      handleClientError(error);
    } finally {
      setSubmitting(false);
    }
  };


  const handleCancel = () => router.push("/");

  return (
    <div className="min-h-screen bg-[#fff]">
      <main className="max-w-7xl mx-auto py-8 px-4">
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

