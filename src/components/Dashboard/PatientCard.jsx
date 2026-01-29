"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GripHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export const PatientCard = ({
  patient,
  onEdit,
  onDelete,
  onClick,
  dragHandleProps,
  isOverlay,
}) => {
  const [waitTimeDisplay, setWaitTimeDisplay] = React.useState("...");
  const [ageDisplay, setAgeDisplay] = React.useState("N/A");

  // Calculate stats in useEffect to avoid impure render (Date.now())
  // and hydration mismatches.
  React.useEffect(() => {
    const now = Date.now();

    // 1. Calculate Age
    if (patient.dateOfBirth) {
      const diff = now - new Date(patient.dateOfBirth).getTime();
      const age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
      setAgeDisplay(age);
    }

    // 2. Calculate Wait Time with Formatting
    if (patient.registeredAt) {
      const diffMs = now - new Date(patient.registeredAt).getTime();
      const mins = Math.floor(diffMs / 60000);

      if (mins < 60) {
        setWaitTimeDisplay(`${mins}m`);
      } else if (mins < 1440) {
        // Less than 24 hours
        const hours = Math.floor(mins / 60);
        setWaitTimeDisplay(`${hours}h`);
      } else {
        const days = Math.floor(mins / 1440);
        setWaitTimeDisplay(`${days}d`);
      }
    } else {
      setWaitTimeDisplay("0m");
    }

    // Optional: Set up an interval to update wait time every minute
    const interval = setInterval(() => {
      // Re-run the logic? For simplicity in this component structure,
      // we can just rely on the initial load or dependency changes,
      // OR trigger a re-render.
      // Given the "Dashboard" usage, live update is nice.
      // We'll just copy logic or abstract it.
      // keeping it simple: just update logic inside interval
      const currentNow = Date.now();
      if (patient.registeredAt) {
        const dMs = currentNow - new Date(patient.registeredAt).getTime();
        const m = Math.floor(dMs / 60000);
        if (m < 60) setWaitTimeDisplay(`${m}m`);
        else if (m < 1440) setWaitTimeDisplay(`${Math.floor(m / 60)}h`);
        else setWaitTimeDisplay(`${Math.floor(m / 1440)}d`);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [patient.dateOfBirth, patient.registeredAt]);

  const hasVitals =
    patient.vitalSigns && Object.keys(patient.vitalSigns).length > 0;
  const isHighPain = (patient.painLevel || 0) > 6;

  return (
    <Card
      {...dragHandleProps} // Applied to the entire card
      onClick={() => onClick?.(patient)}
      className={`p-4 border shadow-sm transition-all group relative
        cursor-grab active:cursor-grabbing hover:border-teal-400
        ${isOverlay ? "shadow-2xl rotate-2 scale-105 bg-white border-teal-500" : "bg-white border-gray-100"}
      `}
    >
      <div className="flex gap-3">
        {/* Visual Grip Handle */}
        <div className="mt-1 text-gray-300 group-hover:text-teal-500 transition-colors">
          <GripHorizontal className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {patient.fullName}{" "}
                <span className="text-gray-400 font-normal text-sm ml-1">
                  ({ageDisplay}y, {patient.gender})
                </span>
              </h3>
            </div>

            {hasVitals ? (
              <Badge
                variant="outline"
                className="bg-teal-50 text-teal-600 border-teal-200 text-[10px] px-2 py-0.5 font-medium flex gap-1 items-center"
              >
                <CheckCircle className="w-3 h-3" /> Vitals provided
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-500 border-red-200 text-[10px] px-2 py-0.5 font-medium flex gap-1 items-center"
              >
                <AlertCircle className="w-3 h-3" /> Missing Vitals
              </Badge>
            )}
          </div>

          {/* Symptoms */}
          <div className="text-sm text-gray-600 mb-3 flex gap-2">
            <span className="font-semibold text-gray-900 shrink-0">=</span>
            <span className="font-semibold text-gray-700 shrink-0">
              Symptoms:
            </span>
            <span className="truncate">{patient.symptoms}</span>
          </div>

          {/* Footer Stats & Actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className={`${isHighPain ? "bg-red-100 text-red-700" : "bg-teal-50 text-teal-700"} border-transparent rounded px-2`}
              >
                Pain: {patient.painLevel}/10
              </Badge>
              <Badge
                variant="secondary"
                className="bg-yellow-50 text-yellow-700 border-yellow-100 rounded px-2"
              >
                Wait time: {waitTimeDisplay}
              </Badge>
            </div>

            {/* Action Buttons with Stop Propagation */}
            <div className="flex gap-1 relative z-10">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(patient);
                }}
                className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(patient);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
