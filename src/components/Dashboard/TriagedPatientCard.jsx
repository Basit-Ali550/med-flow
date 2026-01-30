"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, calculateAge, formatWaitTime, cToF } from "@/lib/utils";
import {
    Brain,
    Pencil,
    Trash2,
    Heart,
    Thermometer,
    Activity,
    Wind,
    Lightbulb,
} from "lucide-react";

export const TriagedPatientCard = ({
    patient,
    onEdit,
    onDelete,
    onVitals,
    dragHandleProps,
    isOverlay,
}) => {
    const [waitTimeDisplay, setWaitTimeDisplay] = useState(
        formatWaitTime(patient.registeredAt)
    );
    const ageDisplay = calculateAge(patient.dateOfBirth);

    useEffect(() => {
        const interval = setInterval(() => {
            setWaitTimeDisplay(formatWaitTime(patient.registeredAt));
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [patient.registeredAt]);

    const vitals = patient.vitalSigns || {};

    // AI Analysis (Only show if present)
    const aiAnalysis = patient.aiAnalysis || patient.nurseNotes; // Fallback to nurseNotes if analysis missing, or hide

    // Vitals Display Helpers
    const bpDisplay = vitals.bloodPressureSys && vitals.bloodPressureDia
        ? `${vitals.bloodPressureSys}/${vitals.bloodPressureDia}`
        : "--/--";

    const tempDisplay = vitals.temperature
        ? `${cToF(vitals.temperature)}°F`
        : "--°F";

    return (
        <Card
            {...dragHandleProps}
            // Ensure onClick is passed if parent logic requires it (e.g. for selection)
            className={cn(
                "p-5 rounded-2xl transition-all group relative border cursor-default bg-white",
                isOverlay ? "shadow-2xl rotate-1 scale-105 border-teal-500" : "border-red-100 shadow-sm hover:shadow-md"
            )}
        >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-lg">
                        {patient.fullName.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight">
                            {patient.fullName}
                        </h3>
                        <p className="text-gray-500 text-xs">
                            {patient.gender} • {ageDisplay} years
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onVitals?.(patient); }} className="p-1.5 rounded-lg border border-gray-200 text-violet-500 hover:bg-violet-50 transition-colors">
                        <Heart className="w-4 h-4" />
                    </button>
                    {/* Placeholder for AI/Analysis action if needed */}
                    <button className="p-1.5 rounded-lg border border-gray-200 text-violet-500 hover:bg-violet-50 transition-colors">
                        <Activity className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit?.(patient); }} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(patient); }} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Complaint */}
            <div className="mb-4">
                <p className="text-sm text-gray-700 font-medium">
                    : {patient.symptoms || "No symptoms recorded."}
                </p>
            </div>

            {/* AI Analysis Block - Only rendered if data exists */}
            {aiAnalysis && (
                <div className="bg-indigo-50/50 rounded-xl p-4 mb-4 border border-indigo-100">
                    <div className="flex gap-3">
                        <div className="mt-1 shrink-0">
                            <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center">
                                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                        </div>
                        <p className="text-[11px] leading-relaxed text-indigo-900 font-medium">
                            {aiAnalysis}
                        </p>
                    </div>
                </div>
            )}

            {/* Vitals Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4 bg-green-50/50 p-3 rounded-xl border border-green-100">
                <VitalItem
                    label="BP"
                    value={bpDisplay}
                    unit=""
                    icon={<Heart className="w-3.5 h-3.5 text-green-600" />}
                />
                <VitalItem
                    label="BPM"
                    value={vitals.heartRate || "--"}
                    unit=""
                    icon={<Activity className="w-3.5 h-3.5 text-green-600" />}
                />
                <VitalItem
                    label="Temp"
                    value={tempDisplay}
                    unit=""
                    icon={<Thermometer className="w-3.5 h-3.5 text-green-600" />}
                />
                <VitalItem
                    label="O₂ Sat"
                    value={vitals.o2Saturation ? `${vitals.o2Saturation}%` : "--%"}
                    unit=""
                    icon={<Wind className="w-3.5 h-3.5 text-green-600" />}
                />
            </div>

            {/* Recommended Actions - Placeholder or AI generated */}
            {/* If we have recommended actions in patient object, we verify here. 
                For now we hide if empty or show generic if requested. 
                User said "not show this when card move" referring to AI analysis text. 
                I will hide this block if no explicit recommendations exist. 
            */}
            {patient.recommendedActions && (
                <div className="bg-teal-50/50 rounded-xl p-4 mb-4 border border-teal-100">
                    <div className="flex gap-3">
                        <div className="mt-1 shrink-0">
                            <div className="w-6 h-6 rounded-md bg-teal-100 flex items-center justify-center">
                                <Lightbulb className="w-3.5 h-3.5 text-teal-600" />
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-teal-800 mb-1">Recommended Actions</h4>
                            <div className="text-[11px] leading-relaxed text-teal-900 space-y-1">
                                {patient.recommendedActions}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Actions */}
            <div className="flex gap-2 items-center">
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none rounded-md px-3 py-1 text-xs font-bold">
                    {patient.triageLevel || "Pending"}
                </Badge>

                <Badge className="bg-red-50 text-red-600 border-none rounded-md px-3 py-1 text-xs font-medium">
                    Pain: {patient.painLevel || 0}/10
                </Badge>

                <Badge className="bg-red-50 text-red-600 border-none rounded-md px-3 py-1 text-xs font-medium flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {waitTimeDisplay}
                </Badge>

                {vitals.heartRate && (
                    <div className="ml-auto">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 gap-1 rounded-md px-2">
                            <Activity className="w-3 h-3" /> Vitals ✓
                        </Badge>
                    </div>
                )}

            </div>

        </Card>
    );
};

const VitalItem = ({ label, value, unit, icon }) => (
    <div className="flex flex-col items-center text-center p-1">
        <div className="mb-1">{icon}</div>
        <div className="text-xs font-bold text-gray-900 leading-tight">
            {value} <span className="text-[9px] text-gray-500">{unit}</span>
        </div>
        <div className="text-[9px] text-gray-400 font-medium tracking-wide uppercase">{label}</div>
    </div>
);
