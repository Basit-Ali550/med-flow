"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    History,
    Info,
    BrainCircuit,
    Stethoscope,
    X,
    User,
    AlertTriangle,
    Pill,
    Heart,
    Thermometer,
    Wind,
    Phone,
    MapPin,
    Calendar,
    FileText
} from "lucide-react";
import { calculateAge, cToF } from "@/lib/utils";
import { HistorySection } from "./PatientHistoryModal";
import { AIAnalysisContent } from "./AIAnalysisModal";

export function PatientDetailsModal({ isOpen, onClose, patient, onStartTreatment }) {
    const [activeTab, setActiveTab] = useState("overview");

    if (!patient) return null;

    const age = calculateAge(patient.dateOfBirth);
    const vitals = patient.vitalSigns || {};
    const hasVitals = vitals.bloodPressureSys || vitals.heartRate;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-5xl h-[90vh] p-0 border-0 shadow-2xl rounded-2xl flex flex-col bg-gray-50 overflow-hidden">

                {/* Header - Sticky */}
                <div className="bg-white border-b border-gray-100 p-6 flex items-start justify-between shrink-0 z-20">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-900">{patient.fullName}</h2>
                                {patient.isPinned && <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50">Pinned</Badge>}
                                <Badge className={`${patient.status === 'TRIAGED' ? 'bg-teal-100 text-teal-700' :
                                    patient.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                    } border-0 hover:bg-opacity-80`}>
                                    {patient.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {age} Years</span>
                                <span>•</span>
                                <span className="capitalize">{patient.gender}</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-400" />
                    </Button>
                </div>

                {/* Content Tabs - Scrollable */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <div className="bg-white px-6 border-b border-gray-100 shrink-0">
                        <TabsList className="h-12 bg-transparent gap-2 p-0 w-full justify-start">
                            <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-500 data-[state=active]:text-teal-700 data-[state=active]:shadow-none rounded-none px-4 h-full bg-transparent">Overview</TabsTrigger>
                            <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-500 data-[state=active]:text-teal-700 data-[state=active]:shadow-none rounded-none px-4 h-full bg-transparent">History</TabsTrigger>
                            <TabsTrigger value="vitals" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-500 data-[state=active]:text-teal-700 data-[state=active]:shadow-none rounded-none px-4 h-full bg-transparent">Vitals</TabsTrigger>
                            <TabsTrigger value="ai" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-500 data-[state=active]:text-teal-700 data-[state=active]:shadow-none rounded-none px-4 h-full bg-transparent flex gap-1">
                                AI Analysis <BrainCircuit className="w-3 h-3" />
                            </TabsTrigger>
                            <TabsTrigger value="details" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-500 data-[state=active]:text-teal-700 data-[state=active]:shadow-none rounded-none px-4 h-full bg-transparent">Full Details</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto w-full">
                        <div className="p-6 max-w-5xl mx-auto space-y-6">

                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="mt-0 focus-visible:ring-0 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    {/* Chief Complaint / Symptoms */}
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3 uppercase tracking-wider">
                                                <Activity className="w-4 h-4 text-teal-600" />
                                                Chief Complaint
                                            </h3>
                                            <p className="text-lg text-gray-800 leading-relaxed font-medium">
                                                "{patient.chiefComplaint || patient.symptoms || "No specific complaints recorded."}"
                                            </p>
                                        </div>

                                        {patient.aiAnalysis && (
                                            <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                                    <BrainCircuit className="w-24 h-24 text-indigo-600" />
                                                </div>
                                                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-3 uppercase tracking-wider relative z-10">
                                                    <BrainCircuit className="w-4 h-4 text-indigo-600" />
                                                    Previous AI Insight
                                                </h3>
                                                <p className="text-sm text-indigo-800 leading-relaxed relative z-10">
                                                    {typeof patient.aiAnalysis === 'object' ? patient.aiAnalysis.reasoning : patient.aiAnalysis}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vitals Snapshot */}
                                    <div className="md:col-span-1">
                                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full">
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 uppercase tracking-wider">
                                                <Activity className="w-4 h-4 text-rose-500" />
                                                Vitals Snapshot
                                            </h3>
                                            {!hasVitals ? (
                                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                    <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                                                    <span className="text-xs">No vitals recorded</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                                        <span className="text-sm text-gray-500 flex items-center gap-2"><Heart className="w-4 h-4 text-gray-400" /> BP</span>
                                                        <span className="font-bold text-gray-900">{vitals.bloodPressureSys}/{vitals.bloodPressureDia}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                                        <span className="text-sm text-gray-500 flex items-center gap-2"><Activity className="w-4 h-4 text-gray-400" /> HR</span>
                                                        <span className="font-bold text-gray-900">{vitals.heartRate} <span className="text-xs font-normal text-gray-400">bpm</span></span>
                                                    </div>
                                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                                        <span className="text-sm text-gray-500 flex items-center gap-2"><Thermometer className="w-4 h-4 text-gray-400" /> Temp</span>
                                                        <span className="font-bold text-gray-900">{vitals.temperature ? cToF(vitals.temperature) : '--'}°F</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500 flex items-center gap-2"><Wind className="w-4 h-4 text-gray-400" /> O₂</span>
                                                        <span className="font-bold text-gray-900">{vitals.o2Saturation}%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* HISTORY TAB */}
                            <TabsContent value="history" className="mt-0 focus-visible:ring-0 space-y-4">
                                <HistorySection
                                    icon={<History className="text-blue-500" />}
                                    title="Medical History"
                                    subtitle="Chronic conditions & prior illnesses"
                                    content={patient.medicalHistory || patient.chronicConditions}
                                    emptyMessage="No recorded medical history on file."
                                />
                                <HistorySection
                                    icon={<Pill className="text-purple-500" />}
                                    title="Medications"
                                    subtitle="Current regular medications"
                                    content={patient.medications}
                                    emptyMessage="No recorded medications."
                                />
                                <HistorySection
                                    icon={<AlertTriangle className="text-rose-500" />}
                                    title="Allergies"
                                    subtitle="Drug, Food or Environmental"
                                    content={patient.allergies}
                                    emptyMessage="No known clinical allergies."
                                    isRed={!!patient.allergies}
                                />
                            </TabsContent>

                            {/* VITALS TAB */}
                            <TabsContent value="vitals" className="mt-0 focus-visible:ring-0">
                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold mb-6">Detailed Vitals</h3>
                                    {/* Reuse or re-implement logic for detailed vitals or charts here in future */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <VitalCard label="Blood Pressure" value={`${vitals.bloodPressureSys || '--'}/${vitals.bloodPressureDia || '--'}`} unit="mmHg" icon={<Activity className="text-red-500" />} />
                                        <VitalCard label="Heart Rate" value={vitals.heartRate || '--'} unit="bpm" icon={<Heart className="text-emerald-500" />} />
                                        <VitalCard label="Temperature" value={vitals.temperature ? cToF(vitals.temperature) : '--'} unit="°F" icon={<Thermometer className="text-orange-500" />} />
                                        <VitalCard label="O2 Saturation" value={vitals.o2Saturation || '--'} unit="%" icon={<Wind className="text-blue-500" />} />
                                        <VitalCard label="Respiratory Rate" value={vitals.respiratoryRate || '--'} unit="bpm" icon={<Wind className="text-gray-500" />} />
                                    </div>
                                    <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                                        More historical vital data will be plotted here.
                                    </div>
                                </div>
                            </TabsContent>

                            {/* AI ANALYSIS TAB */}
                            <TabsContent value="ai" className="mt-0 focus-visible:ring-0 h-full">
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                                    <AIAnalysisContent patient={patient} />
                                </div>
                            </TabsContent>

                            {/* FULL DETAILS TAB */}
                            <TabsContent value="details" className="mt-0 focus-visible:ring-0">
                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Personal Information</h4>
                                            <div className="space-y-4">
                                                <DetailRow label="Full Name" value={patient.fullName} />
                                                <DetailRow label="Date of Birth" value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                                <DetailRow label="Gender" value={patient.gender} className="capitalize" />
                                                <DetailRow label="Contact" value={patient.contactNumber} icon={<Phone className="w-3 h-3" />} />
                                                <DetailRow label="Address" value={patient.address} icon={<MapPin className="w-3 h-3" />} />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Insurance & Administrative</h4>
                                            <div className="space-y-4">
                                                <DetailRow label="Insurance Provider" value={patient.insuranceProvider || 'Self-pay'} />
                                                <DetailRow label="Policy Number" value={patient.insurancePolicyNumber || 'N/A'} />
                                                <DetailRow label="Registration ID" value={patient._id} className="font-mono text-xs" />
                                                <DetailRow label="Registered At" value={new Date(patient.registeredAt).toLocaleString()} />
                                            </div>
                                        </div>
                                    </div>

                                    {patient.notes && (
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-2">Additional Notes</h4>
                                            <p className="text-gray-700 bg-yellow-50 p-4 rounded-md text-sm border border-yellow-100">
                                                <FileText className="w-4 h-4 inline mr-2 text-yellow-600" />
                                                {patient.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                        </div>
                    </div>
                </Tabs>

                {/* Footer Actions - Sticky */}
                <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0 z-20">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button
                        onClick={() => { onClose(); onStartTreatment?.(patient); }}
                        className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
                    >
                        <Stethoscope className="w-4 h-4" /> Start Treatment
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}

const VitalCard = ({ label, value, unit, icon }) => (
    <div className="bg-gray-50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-gray-100">
        <div className="mb-2 p-2 bg-white rounded-full shadow-sm">{icon}</div>
        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{label}</span>
        <span className="text-xl font-bold text-gray-900">{value} <span className="text-xs font-normal text-gray-400">{unit}</span></span>
    </div>
);

const DetailRow = ({ label, value, icon, className = "" }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span className="text-sm text-gray-500 flex items-center gap-2">{icon} {label}</span>
        <span className={`text-sm font-medium text-gray-900 ${className}`}>{value || '—'}</span>
    </div>
);
