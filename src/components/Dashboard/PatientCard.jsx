"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, calculateAge, formatWaitTime, cToF, isVitalAbnormal } from "@/lib/utils";
import {
  GripHorizontal,
  Pencil,
  Trash2,
  Heart,
  History,
  Activity,
  Clock,
  Eye,
  Thermometer,
  Wind,
  Pin,
} from "lucide-react";

export const PatientCard = ({
  patient,
  onEdit,
  onDelete,
  onHistory,
  onVitals,
  onPin, // Add onPin
  onClick,
  dragHandleProps,
  isOverlay,
}) => {
  const [waitTimeDisplay, setWaitTimeDisplay] = useState(
    formatWaitTime(patient.registeredAt),
  );
  const ageDisplay = calculateAge(patient.dateOfBirth);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaitTimeDisplay(formatWaitTime(patient.registeredAt));
    }, 60000);
    return () => clearInterval(interval);
  }, [patient.registeredAt]);

  const isHighPain = (patient.painLevel || 0) > 6;

  // Check if any vital sign exists
  const hasVitals = patient.vitalSigns && (
    patient.vitalSigns.bloodPressureSys ||
    patient.vitalSigns.heartRate ||
    patient.vitalSigns.temperature ||
    patient.vitalSigns.o2Saturation
  );

  return (
    <Card
      {...dragHandleProps}
      onClick={() => onClick?.(patient)}
      className={cn(
        "p-5 rounded-2xl transition-all group relative border cursor-pointer hover:shadow-md",
        isOverlay
          ? "shadow-2xl rotate-2 scale-105 bg-white border-yellow-400 z-50"
          : "bg-white border-yellow-100/50 shadow-sm"
      )}
    >

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-lg">
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

        {/* Action Buttons Stack */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-white/80 p-1 rounded-lg backdrop-blur-sm">
          {/* Vitals Button (Heart) - New */}
          <button onClick={(e) => { e.stopPropagation(); onVitals?.(patient); }} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
            <Heart className="w-3.5 h-3.5" />
          </button>

          {/* Visual/View History Button (Eye/History) - Updated/New */}
          <button onClick={(e) => { e.stopPropagation(); onHistory?.(patient); }} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button onClick={(e) => { e.stopPropagation(); onPin?.(patient); }} className={cn("p-1.5 rounded-lg border border-gray-200 hover:bg-orange-50 transition-colors", patient.isPinned ? "text-orange-500 bg-orange-50 border-orange-200" : "text-gray-400 hover:text-orange-500")}>
            <Pin className={cn("w-3.5 h-3.5", patient.isPinned && "fill-current")} />
          </button>

          <button onClick={(e) => { e.stopPropagation(); onEdit?.(patient); }} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button onClick={(e) => { e.stopPropagation(); onDelete?.(patient); }} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4 pl-[52px]">
        <p className="text-sm text-gray-700 font-medium line-clamp-2">
          {patient.symptoms}
        </p>

        {/* Conditional Vitals Display */}
        {hasVitals && (
          <div className="mt-3 grid grid-cols-4 gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                <Heart className="w-3 h-3 text-red-500" /> BP
              </div>
              <div className={cn("text-xs font-bold mt-0.5", (isVitalAbnormal('bloodPressureSys', patient.vitalSigns.bloodPressureSys) || isVitalAbnormal('bloodPressureDia', patient.vitalSigns.bloodPressureDia)) ? "text-red-600 font-extrabold" : "text-gray-900")}>
                {patient.vitalSigns.bloodPressureSys}/{patient.vitalSigns.bloodPressureDia}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                <Activity className="w-3 h-3 text-emerald-500" /> BPM
              </div>
              <div className={cn("text-xs font-bold mt-0.5", isVitalAbnormal('heartRate', patient.vitalSigns.heartRate) ? "text-red-600 font-extrabold" : "text-gray-900")}>
                {patient.vitalSigns.heartRate || "--"}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                <Thermometer className="w-3 h-3 text-orange-500" /> Temp
              </div>
              <div className={cn("text-xs font-bold mt-0.5", isVitalAbnormal('temperature', patient.vitalSigns.temperature) ? "text-red-600 font-extrabold" : "text-gray-900")}>
                {patient.vitalSigns.temperature ? `${cToF(patient.vitalSigns.temperature)}°` : "--"}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                <Wind className="w-3 h-3 text-blue-500" /> O₂
              </div>
              <div className={cn("text-xs font-bold mt-0.5", isVitalAbnormal('o2Saturation', patient.vitalSigns.o2Saturation) ? "text-red-600 font-extrabold" : "text-gray-900")}>
                {patient.vitalSigns.o2Saturation ? `${patient.vitalSigns.o2Saturation}%` : "--"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Badges */}
      <div className="flex items-center gap-2 pl-[52px]">
        <Badge className="bg-orange-50 text-orange-600 border-none rounded-md px-3 py-1.5 text-xs font-bold shadow-none hover:bg-orange-100">
          Pain: {patient.painLevel}/10
        </Badge>

        <Badge className="bg-red-50 text-red-500 border-none rounded-md px-3 py-1.5 text-xs font-bold shadow-none hover:bg-red-100 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> {waitTimeDisplay}
        </Badge>
      </div>

    </Card>
  );
};
