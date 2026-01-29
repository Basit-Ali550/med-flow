"use client";

import React, { useState } from "react";
import {
  Header,
  Button,
  PatientList,
  DropZone,
  PlusIcon,
} from "@/components";
import { initialPatients, initialScheduledPatients } from "@/data/patients";

export default function Home() {
  const [unscheduledPatients, setUnscheduledPatients] = useState(initialPatients);
  const [scheduledPatients, setScheduledPatients] = useState(initialScheduledPatients);

  const handleAddPatient = () => {
    // TODO: Open add patient modal
    console.log("Add patient clicked");
  };

  const handleEditPatient = (patient) => {
    // TODO: Open edit patient modal
    console.log("Edit patient:", patient);
  };

  const handleDeletePatient = (patient) => {
    // TODO: Confirm and delete patient
    console.log("Delete patient:", patient);
    setUnscheduledPatients((prev) =>
      prev.filter((p) => p.id !== patient.id)
    );
    setScheduledPatients((prev) =>
      prev.filter((p) => p.id !== patient.id)
    );
  };

  const handleDropToTriage = () => {
    // TODO: Handle drag and drop logic
    console.log("Patient dropped to triage");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Patient Button */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={handleAddPatient}
            icon={<PlusIcon className="w-5 h-5" />}
          >
            Add Patient
          </Button>
        </div>

        {/* Unscheduled Patients */}
        <div className="mb-10">
          <PatientList
            patients={unscheduledPatients}
            title="unscheduled patients"
            onEdit={handleEditPatient}
            onDelete={handleDeletePatient}
          />
        </div>

        {/* Scheduled Patients - Drop Zone */}
        <div>
          <DropZone
            patients={scheduledPatients}
            title="scheduled patients"
            onDrop={handleDropToTriage}
            onEdit={handleEditPatient}
            onDelete={handleDeletePatient}
          />
        </div>
      </main>
    </div>
  );
}
