 "use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {  User, Stethoscope } from "lucide-react";
import Image from "next/image";
import logo from "@/assets/Images/MedFlow.svg";

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole === "patient") {
      router.push("/patient/register");
    } else if (selectedRole === "nurse") {
      router.push("/nurse/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 shadow-xl bg-white rounded-3xl border-0">
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <div className="flex items-center justify-center mb-2 ">
            <Image src={logo} alt="Logo" width={200} height={200} />
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Welcome to MedFlow</h1>
          <p className="text-[#64748b] text-sm">Please select your role to continue</p>
        </div>

        <div className="space-y-4">
          {/* Patient Option */}
          <div
            onClick={() => setSelectedRole("patient")}
            className={`
              relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4
              ${selectedRole === "patient"
                ? "border-[#10b981] bg-[#10b981]/5 shadow-sm"
                : "border-gray-100 hover:border-gray-200 bg-white"}
            `}
          >
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
              ${selectedRole === "patient" ? "bg-[#10b981]/20" : "bg-[#d1fae5]"}
            `}>
              <User className={`w-6 h-6 ${selectedRole === "patient" ? "text-[#10b981]" : "text-[#10b981]"}`} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-[#0f172a]">Patient</h3>
              <p className="text-xs text-[#64748b]">I am here to register for patient</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selectedRole === "patient" ? "border-[#10b981]" : "border-gray-300"}`}>
              {selectedRole === "patient" && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              )}
            </div>
          </div>

          {/* Nurse Option */}
          <div
            onClick={() => setSelectedRole("nurse")}
            className={`
              relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4
              ${selectedRole === "nurse"
                ? "border-[#6366f1] bg-[#6366f1]/5 shadow-sm"
                : "border-gray-100 hover:border-gray-200 bg-white"}
            `}
          >
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
              ${selectedRole === "nurse" ? "bg-[#6366f1]/20" : "bg-[#e0e7ff]"}
            `}>
              <Stethoscope className={`w-6 h-6 ${selectedRole === "nurse" ? "text-[#6366f1]" : "text-[#4f46e5]"}`} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-[#0f172a]">Nurse / Staff</h3>
              <p className="text-xs text-[#64748b]">I am a healthcare professional managing patients</p>
            </div>
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selectedRole === "nurse" ? "border-[#6366f1]" : "border-gray-300"}
            `}>
              {selectedRole === "nurse" && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`
            w-full mt-8 py-3 rounded-xl font-semibold transition-all duration-200
            ${selectedRole
              ? "bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#0f172a] shadow-sm transform active:scale-[0.98]"
              : "bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed"}
          `}
        >
          Continue
        </button>
      </Card>
    </div>
  );
}