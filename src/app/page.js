"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
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

  // Show success toast on initial load
  useEffect(() => {
    toast.success("Patient successfully edited.");
  }, []);

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "var(--color-bg-primary)",
    },
    main: {
      maxWidth: "1024px",
      margin: "0 auto",
      padding: "32px 16px",
    },
    buttonWrapper: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "24px",
    },
    plusIcon: {
      width: "20px",
      height: "20px",
    },
    section: {
      marginBottom: "40px",
    },
  };

  const handleAddPatient = () => {
    console.log("Add patient clicked");
    toast.success("Add patient modal opened");
  };

  const handleEditPatient = (patient) => {
    console.log("Edit patient:", patient);
    toast.success("Patient successfully edited.");
  };

  const handleDeletePatient = (patient) => {
    console.log("Delete patient:", patient);
    setUnscheduledPatients((prev) => prev.filter((p) => p.id !== patient.id));
    setScheduledPatients((prev) => prev.filter((p) => p.id !== patient.id));
    toast.success("Patient deleted successfully.");
  };

  const handleDropToTriage = () => {
    console.log("Patient dropped to triage");
    toast.success("Patient added to triage.");
  };

  return (
    <div style={styles.container}>
      {/* Sonner Toaster */}
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            marginTop: "80px",
          },
        }}
      />

      <Header />

      <main style={styles.main}>
        {/* Add Patient Button */}
        <div style={styles.buttonWrapper}>
          <Button
            onClick={handleAddPatient}
            icon={<PlusIcon style={styles.plusIcon} />}
          >
            Add Patient
          </Button>
        </div>

        {/* Unscheduled Patients */}
        <div style={styles.section}>
          <PatientList
            patients={unscheduledPatients}
            title="unscheduled patients"
            onEdit={handleEditPatient}
            onDelete={handleDeletePatient}
          />
        </div>

        {/* Scheduled Patients - Drop Zone */}
        <div style={styles.section}>
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
