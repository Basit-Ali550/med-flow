"use client";

import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Menu, 
  GripHorizontal, 
  Pencil, 
  Trash2, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";

// Sample patient data
const samplePatients = [
  {
    id: 1,
    name: "John Doe",
    age: 50,
    gender: "Male",
    symptoms: "Sudden One-Sided Weakness, Slurred Speech",
    painLevel: 2,
    waitTime: 30,
    vitalsProvided: true,
  },
  {
    id: 2,
    name: "Elena Petrova",
    age: 36,
    gender: "Female",
    symptoms: "Severe abdominal pain",
    painLevel: 5,
    waitTime: 25,
    vitalsProvided: false,
  },
];

// Patient Card Component
const PatientCard = ({ patient, onEdit, onDelete }) => {
  const styles = {
    card: {
      marginBottom: "12px",
      borderLeft: patient.vitalsProvided ? "4px solid #fde047" : "4px solid #ef4444",
      padding: "16px",
      backgroundColor: "#fff",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "8px",
    },
    leftContent: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
    },
    dragHandle: {
      color: "#9ca3af",
      cursor: "grab",
      marginTop: "2px",
    },
    nameRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    name: {
      fontWeight: "600",
      fontSize: "16px",
      color: "#111827",
    },
    demographics: {
      fontSize: "14px",
      color: "#6b7280",
    },
    symptoms: {
      fontSize: "14px",
      color: "#6b7280",
      marginTop: "4px",
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
    },
    symptomsLabel: {
      fontWeight: "500",
    },
    badges: {
      display: "flex",
      gap: "8px",
      marginTop: "12px",
    },
    actions: {
      display: "flex",
      gap: "4px",
    },
  };

  return (
    <Card style={styles.card}>
      <div style={styles.header}>
        <div style={styles.leftContent}>
          <GripHorizontal style={styles.dragHandle} className="w-5 h-5" />
          <div>
            <div style={styles.nameRow}>
              <span style={styles.name}>{patient.name}</span>
              <span style={styles.demographics}>
                ({patient.age}y, {patient.gender})
              </span>
            </div>
            <div style={styles.symptoms}>
              <span style={styles.symptomsLabel}>Symptoms:</span>
              <span>{patient.symptoms}</span>
            </div>
            <div style={styles.badges}>
              <Badge className="bg-red-500 text-white rounded-md px-2 py-1 text-xs">
                Pain: {patient.painLevel}/10
              </Badge>
              <Badge className="bg-yellow-300 text-gray-800 rounded-md px-2 py-1 text-xs">
                Wait time: {patient.waitTime} minutes
              </Badge>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
          {patient.vitalsProvided ? (
            <Badge variant="outline" className="text-teal-600 border-teal-600 gap-1 rounded-md">
              <CheckCircle className="w-3 h-3" />
              Vitals provided
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-500 border-red-500 gap-1 rounded-md">
              <AlertCircle className="w-3 h-3" />
              Missing Vitals
            </Badge>
          )}
          <div style={styles.actions}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit?.(patient)}
              className="hover:text-teal-600 hover:bg-teal-50"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete?.(patient)}
              className="hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function NurseDashboard() {
  const [unscheduledPatients, setUnscheduledPatients] = useState(samplePatients);
  const [scheduledPatients, setScheduledPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddPatient = () => {
    toast.success("Add patient modal opened");
  };

  const handleEditPatient = (patient) => {
    toast.success("Patient successfully edited.");
  };

  const handleDeletePatient = (patient) => {
    setUnscheduledPatients((prev) => prev.filter((p) => p.id !== patient.id));
    setScheduledPatients((prev) => prev.filter((p) => p.id !== patient.id));
    toast.success("Patient deleted successfully.");
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f3f4f6",
    },
    header: {
      backgroundColor: "#0d9488",
      color: "#fff",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logo: {
      backgroundColor: "#fff",
      borderRadius: "9999px",
      padding: "8px 12px",
      display: "flex",
      alignItems: "center",
      gap: "2px",
    },
    logoMed: {
      color: "#0d9488",
      fontWeight: "700",
      fontSize: "12px",
    },
    logoFlow: {
      color: "#14b8a6",
      fontWeight: "700",
      fontSize: "12px",
    },
    headerCenter: {
      textAlign: "center",
    },
    headerTitle: {
      fontSize: "24px",
      fontWeight: "600",
    },
    headerSubtitle: {
      fontSize: "14px",
      color: "#ccfbf1",
      marginTop: "2px",
    },
    menuButton: {
      color: "#fff",
    },
    main: {
      padding: "24px",
    },
    topBar: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: "16px",
      marginBottom: "24px",
    },
    searchWrapper: {
      position: "relative",
      width: "250px",
    },
    searchIcon: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af",
    },
    columnsContainer: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
    },
    column: {
      backgroundColor: "transparent",
    },
    columnHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
      padding: "12px 16px",
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    columnTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#111827",
    },
    columnSubtitle: {
      fontSize: "12px",
      color: "#6b7280",
      marginTop: "2px",
    },
    countBadge: {
      backgroundColor: "#0f766e",
      color: "#fff",
      borderRadius: "8px",
      padding: "6px 14px",
      fontSize: "16px",
      fontWeight: "600",
    },
    dropZone: {
      border: "2px dashed #d1d5db",
      borderRadius: "8px",
      padding: "48px",
      textAlign: "center",
      color: "#9ca3af",
      backgroundColor: "#fff",
      minHeight: "200px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoMed}>Med</span>
          <span style={styles.logoFlow}>Flow</span>
        </div>
        <div style={styles.headerCenter}>
          <h1 style={styles.headerTitle}>Triage Dashboard</h1>
          <p style={styles.headerSubtitle}>Manage patients in the ER</p>
        </div>
        <button style={styles.menuButton}>
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Top Bar with Search and Add Button */}
        <div style={styles.topBar}>
          <div style={styles.searchWrapper}>
            <Input
              placeholder="Search Patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search style={styles.searchIcon} className="w-4 h-4" />
          </div>
          <Button 
            onClick={handleAddPatient}
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Patient
          </Button>
        </div>

        {/* Two Column Layout */}
        <div style={styles.columnsContainer}>
          {/* Unscheduled Column */}
          <div style={styles.column}>
            <div style={styles.columnHeader}>
              <div>
                <div style={styles.columnTitle}>unscheduled</div>
                <div style={styles.columnSubtitle}>Waiting list</div>
              </div>
              <div style={styles.countBadge}>{unscheduledPatients.length}</div>
            </div>
            
            {/* Patient Cards */}
            {unscheduledPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
              />
            ))}
          </div>

          {/* Scheduled Column */}
          <div style={styles.column}>
            <div style={styles.columnHeader}>
              <div>
                <div style={styles.columnTitle}>scheduled</div>
                <div style={styles.columnSubtitle}>Triaged list</div>
              </div>
              <div style={styles.countBadge}>{scheduledPatients.length}</div>
            </div>
            
            {/* Drop Zone */}
            {scheduledPatients.length === 0 ? (
              <div style={styles.dropZone}>
                Drag patients here for Triage
              </div>
            ) : (
              scheduledPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onEdit={handleEditPatient}
                  onDelete={handleDeletePatient}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
