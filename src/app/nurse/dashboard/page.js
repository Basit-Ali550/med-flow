"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  return (
    <Card 
      className={`mb-3 p-4 bg-white border-l-4 ${
        patient.vitalsProvided ? "border-l-yellow-300" : "border-l-red-500"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        {/* Left Content */}
        <div className="flex items-start gap-3">
          <GripHorizontal className="w-5 h-5 text-gray-400 cursor-grab mt-0.5" />
          <div>
            {/* Name Row */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-gray-900">
                {patient.name}
              </span>
              <span className="text-sm text-gray-500">
                ({patient.age}y, {patient.gender})
              </span>
            </div>
            
            {/* Symptoms */}
            <div className="text-sm text-gray-500 mt-1 flex items-start gap-2">
              <span className="font-medium">Symptoms:</span>
              <span>{patient.symptoms}</span>
            </div>
            
            {/* Badges */}
            <div className="flex gap-2 mt-3">
              <Badge className="bg-red-500 text-white rounded-md px-2 py-1 text-xs">
                Pain: {patient.painLevel}/10
              </Badge>
              <Badge className="bg-yellow-300 text-gray-800 rounded-md px-2 py-1 text-xs">
                Wait time: {patient.waitTime} minutes
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end gap-3">
          {/* Vitals Status */}
          {patient.vitalsProvided ? (
            <Badge 
              variant="outline" 
              className="text-teal-600 border-teal-600 gap-1 rounded-md"
            >
              <CheckCircle className="w-3 h-3" />
              Vitals provided
            </Badge>
          ) : (
            <Badge 
              variant="outline" 
              className="text-red-500 border-red-500 gap-1 rounded-md"
            >
              <AlertCircle className="w-3 h-3" />
              Missing Vitals
            </Badge>
          )}
          
          {/* Actions */}
          <div className="flex gap-1">
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
  const router = useRouter();
  const [unscheduledPatients, setUnscheduledPatients] = useState(samplePatients);
  const [scheduledPatients, setScheduledPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddPatient = () => {
    router.push("/nurse/add-patient");
  };

  const handleEditPatient = (patient) => {
    toast.success("Patient successfully edited.");
  };

  const handleDeletePatient = (patient) => {
    setUnscheduledPatients((prev) => prev.filter((p) => p.id !== patient.id));
    setScheduledPatients((prev) => prev.filter((p) => p.id !== patient.id));
    toast.success("Patient deleted successfully.");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="bg-teal-600 text-white py-4 px-6 flex items-center justify-between">
        <div className="bg-white rounded-full py-2 px-3 flex items-center gap-0.5">
          <span className="text-teal-600 font-bold text-xs">Med</span>
          <span className="text-teal-500 font-bold text-xs">Flow</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Triage Dashboard</h1>
          <p className="text-sm text-teal-100 mt-0.5">Manage patients in the ER</p>
        </div>
        <button className="text-white">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Top Bar */}
        <div className="flex justify-end items-center gap-4 mb-6">
          <div className="relative w-64">
            <Input
              placeholder="Search Patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
        <div className="grid grid-cols-2 gap-6">
          {/* Unscheduled Column */}
          <div>
            <div className="flex justify-between items-center mb-4 p-3 px-4 bg-white rounded-lg shadow-sm">
              <div>
                <div className="text-base font-semibold text-gray-900">unscheduled</div>
                <div className="text-xs text-gray-500 mt-0.5">Waiting list</div>
              </div>
              <div className="bg-teal-700 text-white rounded-lg px-3.5 py-1.5 text-base font-semibold">
                {unscheduledPatients.length}
              </div>
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
          <div>
            <div className="flex justify-between items-center mb-4 p-3 px-4 bg-white rounded-lg shadow-sm">
              <div>
                <div className="text-base font-semibold text-gray-900">scheduled</div>
                <div className="text-xs text-gray-500 mt-0.5">Triaged list</div>
              </div>
              <div className="bg-teal-700 text-white rounded-lg px-3.5 py-1.5 text-base font-semibold">
                {scheduledPatients.length}
              </div>
            </div>
            
            {/* Drop Zone or Patient Cards */}
            {scheduledPatients.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-400 bg-white min-h-52 flex items-center justify-center">
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
