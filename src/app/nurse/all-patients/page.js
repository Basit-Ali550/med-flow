"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePatients } from "@/hooks/usePatients";
import { PatientCard } from "@/components/Dashboard/PatientCard";
import { DashboardActions } from "@/components/Dashboard/DashboardActions";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Header/Header";

import { PATIENT_STATUS } from "@/lib/constants";

export default function AllPatientsPage() {
  const router = useRouter();
  const { items, isLoading } = usePatients();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter for patients currently In Progress (Treatment Room)
  const treatmentItems = items.filter(p => p.status === PATIENT_STATUS.IN_PROGRESS);

  const filteredItems = treatmentItems.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header title="Treatment Room" subtitle="Patients currently under active care" />
      
      <main className="max-w-7xl mx-auto p-6">
        <DashboardActions 
          searchQuery={searchQuery}
          onSearchChange={e => setSearchQuery(e.target.value)}
          onAddClick={() => router.push("/nurse/add-patient")}
        />

        {isLoading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {filteredItems.map(patient => (
              <PatientCard 
                key={patient._id} 
                patient={patient}
                // Pass handlers to enable interactivity or keep read-only? 
                // User said "show krwao" but reusing card implies some interaction.
                // We'll provide navigation handlers for consistency.
                onEdit={() => router.push(`/nurse/edit-patient/${patient._id}`)}
                onClick={() => router.push(`/nurse/edit-patient/${patient._id}`)} // Or maybe no click action?
                // Minimal props for now as requested "show"
              />
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400">
                No patients found
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
