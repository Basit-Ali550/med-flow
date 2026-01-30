"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { User, ShieldCheck } from "lucide-react";
import Image from "next/image";
import logo from "@/assets/Images/MedFlow.svg";
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
<Image src={logo} alt="Logo" width={600} height={600} />

      {/* Subtitle */}
      <p className="text-xl text-[#64738B] my-12 text-center">
        Please select your role to continue
      </p>

      {/* Role Selection Cards */}
      <div className="grid sm:grid-cols-2 gap-8 w-full  sm:max-w-5xl mx-auto">
        {/* Patient Card */}
        <Card
          className=" p-8 cursor-pointer flex flex-col items-center text-center  hover:border-teal-300 transition-all"
          onClick={handlePatientClick}
        >
          <div className="w-16 h-16 rounded-full bg-teal-600/10 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="sm:text-3xl text-xl font-bold text-[#1E1E1E] ">
            I am a Patient
          </h3>
          <p className="text-sm text-[#64738B]">Register yourself for Triage.</p>
        </Card>

        {/* Nurse Card */}
        <Card
          className=" p-8 cursor-pointer flex flex-col items-center text-center  hover:border-violet-300 transition-all"
          onClick={handleNurseClick}
        >
          <div className="w-16 h-16 rounded-full bg-violet-600/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-violet-600" />
          </div>
         <h3 className="sm:text-3xl text-xl font-bold text-[#1E1E1E]">
            I am a Nurse
          </h3>
          <p className="text-sm text-[#64738B]">
            Manage triage queue and patient data.
          </p>
        </Card>
      </div>
    </div>
  );
}
