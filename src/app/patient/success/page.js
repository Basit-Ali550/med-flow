"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function PatientSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5 text-center">
      <div className="mb-6">
        <CheckCircle className="w-20 h-20 text-teal-600" />
      </div>
      <h1 className="text-3xl font-semibold text-gray-900 mb-3">
        Registration Complete!
      </h1>
      <p className="text-base text-gray-500 mb-8 max-w-md">
        Your registration has been submitted successfully. A nurse will call you
        shortly for triage.
      </p>
      <Button
        onClick={() => router.push("/")}
        className="bg-teal-600 hover:bg-teal-700"
      >
        Back to Home
      </Button>
    </div>
  );
}
