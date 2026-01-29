"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { User, ShieldCheck } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handlePatientClick = () => {
    router.push("/patient/register");
  };

  const handleNurseClick = () => {
    router.push("/nurse/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">
      {/* Logo */}
      <div className="w-72 h-48 bg-teal-50/80 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="text-5xl font-bold text-teal-600">Med</span>
          <span className="text-5xl font-bold text-teal-500">Flow</span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-xl text-gray-500 mb-12 text-center">
        Please select your role to continue
      </p>

      {/* Role Selection Cards */}
      <div className="flex gap-6 flex-wrap justify-center">
        {/* Patient Card */}
        <Card
          className="w-64 p-8 cursor-pointer flex flex-col items-center text-center hover:shadow-lg hover:border-teal-300 transition-all"
          onClick={handlePatientClick}
        >
          <div className="w-16 h-16 rounded-full bg-teal-600/10 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            I am a Patient
          </h3>
          <p className="text-sm text-gray-500">Register yourself for Triage.</p>
        </Card>

        {/* Nurse Card */}
        <Card
          className="w-64 p-8 cursor-pointer flex flex-col items-center text-center hover:shadow-lg hover:border-violet-300 transition-all"
          onClick={handleNurseClick}
        >
          <div className="w-16 h-16 rounded-full bg-violet-600/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-violet-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            I am a Nurse
          </h3>
          <p className="text-sm text-gray-500">
            Manage triage queue and patient data.
          </p>
        </Card>
      </div>
    </div>
  );
}
