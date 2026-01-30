"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, calculateAge, formatWaitTime, cToF, isVitalAbnormal } from "@/lib/utils";
import {
    Pencil,
    Trash2,
    Activity,
    Pin,
    History,
    AlertTriangle,
    Heart,
    Thermometer,
    Wind,
} from "lucide-react";

// Reusing the same helper since it's cleaner
const VitalItem = ({ label, value, unit, icon }) => (
    <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
            {icon} {label}
        </div>
        <div className="text-xs font-bold text-gray-900 mt-0.5">
            {value}
        </div>
    </div>
);

export const TriagedPatientCard = ({
    patient,
    onEdit,
    onDelete,
    onVitals,
    onHistory,
    onPin, // Include onPin prop
    onClick,
    dragHandleProps,
    isOverlay,
}) => {
    const [waitTimeDisplay, setWaitTimeDisplay] = useState(
        formatWaitTime(patient.registeredAt)
    );
    const ageDisplay = calculateAge(patient.dateOfBirth);
    const vitals = patient.vitalSigns || {};
    const hasVitals = vitals.bloodPressureSys || vitals.heartRate || vitals.temperature || vitals.o2Saturation;

    useEffect(() => {
        const interval = setInterval(() => {
            setWaitTimeDisplay(formatWaitTime(patient.registeredAt));
        }, 60000);
        return () => clearInterval(interval);
    }, [patient.registeredAt]);

    return (
        <Card
            {...dragHandleProps}
            onClick={() => onClick?.(patient)}
            className={cn(
                "p-4 rounded-xl transition-all group relative border-l-4 border-y border-r border-[#e2e8f0] cursor-pointer hover:shadow-md bg-white select-none",
                isOverlay ? "shadow-2xl rotate-2 scale-105 border-teal-500 z-50" : "border-l-teal-500",
                patient.isPinned && "border-l-orange-500 ring-1 ring-orange-100 bg-orange-50/10" // Visual cue for pinned
            )}
        >
            {/* 1. Header Row: Name, Info, Pin Action */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-baseline gap-2">
                    <h3 className="font-bold text-gray-900 text-base">
                        {patient.fullName}
                    </h3>
                    <span className="text-gray-400 text-sm font-normal">
                        ({ageDisplay}y, {patient.gender})
                    </span>
                    {/* Visual Pin Indicator for quick scan */}
                    {patient.isPinned && <Pin className="w-3 h-3 text-orange-500 fill-orange-500 self-center ml-1" />}
                </div>

                {/* Status/Vitals Badge if needed, or just cleaner layout */}
                {!hasVitals && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] uppercase font-bold text-red-500 tracking-wide">Missing Vitals</span>
                    </div>
                )}
            </div>

            {/* 2. Symptoms Row */}
            <div className="mb-4 flex items-start gap-2">
                <span className="text-gray-900 font-bold text-sm min-w-fit">=  Symptoms:</span>
                <p className="text-sm text-gray-500 line-clamp-1">
                    {patient.symptoms || "No symptoms recorded"}
                </p>
            </div>

            {/* Vitals Grid - Added back with highlighting */}
            {hasVitals && (
                <div className="mb-3 grid grid-cols-4 gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                            <Heart className="w-3 h-3 text-red-500" /> BP
                        </div>
                        <div className={cn("text-xs font-bold mt-0.5", (isVitalAbnormal('bloodPressureSys', vitals.bloodPressureSys) || isVitalAbnormal('bloodPressureDia', vitals.bloodPressureDia)) ? "text-red-600 font-extrabold" : "text-gray-900")}>
                            {vitals.bloodPressureSys}/{vitals.bloodPressureDia}
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                            <Activity className="w-3 h-3 text-emerald-500" /> BPM
                        </div>
                        <div className={cn("text-xs font-bold mt-0.5", isVitalAbnormal('heartRate', vitals.heartRate) ? "text-red-600 font-extrabold" : "text-gray-900")}>
                            {vitals.heartRate || "--"}
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                            <Thermometer className="w-3 h-3 text-orange-500" /> Temp
                        </div>
                        <div className={cn("text-xs font-bold mt-0.5", isVitalAbnormal('temperature', vitals.temperature) ? "text-red-600 font-extrabold" : "text-gray-900")}>
                            {vitals.temperature ? `${cToF(vitals.temperature)}°` : "--"}
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                            <Wind className="w-3 h-3 text-blue-500" /> O₂
                        </div>
                        <div className={cn("text-xs font-bold mt-0.5", isVitalAbnormal('o2Saturation', vitals.o2Saturation) ? "text-red-600 font-extrabold" : "text-gray-900")}>
                            {vitals.o2Saturation ? `${vitals.o2Saturation}%` : "--"}
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Footer Row: Badges (Left) & Actions (Right) */}
            <div className="flex items-center justify-between mt-2">

                <div className="flex items-center gap-2">
                    <div className="bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-md font-medium border border-teal-100">
                        Pain: {patient.painLevel}/10
                    </div>
                    <div className="bg-yellow-50 text-yellow-700 text-xs px-2.5 py-1 rounded-md font-medium border border-yellow-100">
                        Wait time: {waitTimeDisplay}
                    </div>
                </div>

                <div className="flex items-center gap-1 text-gray-400">
                    {/* PIN BUTTON */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onPin?.(patient); }}
                        className={cn("p-1.5 hover:bg-orange-50 rounded-md transition-colors", patient.isPinned ? "text-orange-500" : "hover:text-orange-500")}
                        title={patient.isPinned ? "Unpin Patient" : "Pin to top"}
                    >
                        <Pin className={cn("w-4 h-4", patient.isPinned && "fill-current")} />
                    </button>

                    <button onClick={(e) => { e.stopPropagation(); onHistory?.(patient); }} className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                        <History className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onVitals?.(patient); }} className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                        <Activity className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit?.(patient); }} className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(patient); }} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </Card>
    );
};
