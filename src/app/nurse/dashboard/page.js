"use client";

import React, { useState, useEffect } from "react";
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
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";

// Patient Card Component
const PatientCard = ({ patient, onEdit, onDelete, isDeleting }) => {
  // Calculate age from dateOfBirth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate wait time from registeredAt
  const calculateWaitTime = (registeredAt) => {
    if (!registeredAt) return 0;
    const now = new Date();
    const registered = new Date(registeredAt);
    return Math.floor((now - registered) / (1000 * 60)); // minutes
  };

  const age = patient.age || calculateAge(patient.dateOfBirth);
  const waitTime = calculateWaitTime(patient.registeredAt);
  const vitalsProvided = !!(patient.vitalSigns && Object.keys(patient.vitalSigns).length > 0);

  return (
    <Card 
      className={`mb-3 p-4 bg-white border-l-4 ${
        vitalsProvided ? "border-l-yellow-300" : "border-l-red-500"
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
                {patient.fullName}
              </span>
              <span className="text-sm text-gray-500">
                ({age}y, {patient.gender || 'N/A'})
              </span>
            </div>
            
            {/* Symptoms */}
            <div className="text-sm text-gray-500 mt-1 flex items-start gap-2">
              <span className="font-medium">Symptoms:</span>
              <span className="line-clamp-1">{patient.symptoms}</span>
            </div>
            
            {/* Badges */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <Badge className="bg-red-500 text-white rounded-md px-2 py-1 text-xs">
                Pain: {patient.painLevel || 0}/10
              </Badge>
              <Badge className="bg-yellow-300 text-gray-800 rounded-md px-2 py-1 text-xs">
                Wait time: {waitTime} minutes
              </Badge>
              {patient.triageLevel && patient.triageLevel !== 'Pending' && (
                <Badge className={`rounded-md px-2 py-1 text-xs ${
                  patient.triageLevel === 'Critical' ? 'bg-red-600 text-white' :
                  patient.triageLevel === 'Urgent' ? 'bg-orange-500 text-white' :
                  patient.triageLevel === 'Semi-Urgent' ? 'bg-yellow-500 text-gray-900' :
                  'bg-green-500 text-white'
                }`}>
                  {patient.triageLevel}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end gap-3">
          {/* Vitals Status */}
          {vitalsProvided ? (
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
              disabled={isDeleting}
              className="hover:text-red-600 hover:bg-red-50"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function NurseDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/patients?limit=50&sortBy=registeredAt&sortOrder=desc');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch patients');
      }
      
      setPatients(data.data?.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error(error.message || 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients based on status
  const unscheduledPatients = patients.filter(p => 
    p.status === 'Waiting' && (p.triageLevel === 'Pending' || !p.triageLevel)
  );
  const scheduledPatients = patients.filter(p => 
    p.status === 'Waiting' && p.triageLevel && p.triageLevel !== 'Pending'
  );

  // Filter by search query
  const filterBySearch = (patientList) => {
    if (!searchQuery.trim()) return patientList;
    const query = searchQuery.toLowerCase();
    return patientList.filter(p => 
      p.fullName?.toLowerCase().includes(query) ||
      p.symptoms?.toLowerCase().includes(query)
    );
  };

  const handleAddPatient = () => {
    router.push("/nurse/add-patient");
  };

  const handleEditPatient = (patient) => {
    // TODO: Implement edit modal or redirect to edit page
    toast.info(`Editing patient: ${patient.fullName}`);
    // router.push(`/nurse/edit-patient/${patient._id}`);
  };

  const handleDeletePatient = async (patient) => {
    if (!confirm(`Are you sure you want to delete ${patient.fullName}?`)) {
      return;
    }

    try {
      setDeletingId(patient._id);
      const response = await fetch(`/api/patients/${patient._id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete patient');
      }
      
      setPatients(prev => prev.filter(p => p._id !== patient._id));
      toast.success(data.message || "Patient deleted successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to delete patient.");
    } finally {
      setDeletingId(null);
    }
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
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatients}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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

        {/* Loading State */}
        {isLoading && patients.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <span className="ml-2 text-gray-600">Loading patients...</span>
          </div>
        ) : (
          /* Two Column Layout */
          <div className="grid grid-cols-2 gap-6">
            {/* Unscheduled Column */}
            <div>
              <div className="flex justify-between items-center mb-4 p-3 px-4 bg-white rounded-lg shadow-sm">
                <div>
                  <div className="text-base font-semibold text-gray-900">unscheduled</div>
                  <div className="text-xs text-gray-500 mt-0.5">Waiting list</div>
                </div>
                <div className="bg-teal-700 text-white rounded-lg px-3.5 py-1.5 text-base font-semibold">
                  {filterBySearch(unscheduledPatients).length}
                </div>
              </div>
              
              {/* Patient Cards */}
              {filterBySearch(unscheduledPatients).length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 bg-white">
                  No unscheduled patients
                </div>
              ) : (
                filterBySearch(unscheduledPatients).map((patient) => (
                  <PatientCard
                    key={patient._id}
                    patient={patient}
                    onEdit={handleEditPatient}
                    onDelete={handleDeletePatient}
                    isDeleting={deletingId === patient._id}
                  />
                ))
              )}
            </div>

            {/* Scheduled Column */}
            <div>
              <div className="flex justify-between items-center mb-4 p-3 px-4 bg-white rounded-lg shadow-sm">
                <div>
                  <div className="text-base font-semibold text-gray-900">scheduled</div>
                  <div className="text-xs text-gray-500 mt-0.5">Triaged list</div>
                </div>
                <div className="bg-teal-700 text-white rounded-lg px-3.5 py-1.5 text-base font-semibold">
                  {filterBySearch(scheduledPatients).length}
                </div>
              </div>
              
              {/* Drop Zone or Patient Cards */}
              {filterBySearch(scheduledPatients).length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-400 bg-white min-h-52 flex items-center justify-center">
                  Drag patients here for Triage
                </div>
              ) : (
                filterBySearch(scheduledPatients).map((patient) => (
                  <PatientCard
                    key={patient._id}
                    patient={patient}
                    onEdit={handleEditPatient}
                    onDelete={handleDeletePatient}
                    isDeleting={deletingId === patient._id}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

