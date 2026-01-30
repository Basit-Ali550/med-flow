"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, calculateAge, formatWaitTime } from "@/lib/utils";
import {
  GripHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle,
  History,
  Activity,
} from "lucide-react";

export const PatientCard = ({
  patient,
  onEdit,
  onDelete,
  onHistory,
  onVitals,
  onClick,
  dragHandleProps,
  isOverlay,
}) => {
  const [waitTimeDisplay, setWaitTimeDisplay] = useState(
    formatWaitTime(patient.registeredAt),
  );
  const ageDisplay = calculateAge(patient.dateOfBirth);

  useEffect(() => {
    // Update wait time every minute
    const interval = setInterval(() => {
      setWaitTimeDisplay(formatWaitTime(patient.registeredAt));
    }, 60000);

    return () => clearInterval(interval);
  }, [patient.registeredAt]);

  const hasVitals =
    patient.vitalSigns && Object.keys(patient.vitalSigns).length > 0;
  const isHighPain = (patient.painLevel || 0) > 6;

  return (
    <Card
      {...dragHandleProps}
      onClick={() => onClick?.(patient)}
      className={cn(
        "p-4 border shadow-sm transition-all group relative cursor-pointer active:cursor-grabbing hover:border-teal-400",
        isOverlay
          ? "shadow-2xl rotate-2 scale-105 bg-white border-teal-500"
          : "bg-white border-gray-100",
      )}
    >
      <div className="flex gap-3">
        {/* Grip Handle */}
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

            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-2 py-0.5 font-medium flex gap-1 items-center",
                hasVitals
                  ? "bg-teal-50 text-teal-600 border-teal-200"
                  : "bg-red-50 text-red-500 border-red-200",
              )}
            >
              {hasVitals ? (
                <>
                  <CheckCircle className="w-3 h-3" /> Vitals provided
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" /> Missing Vitals
                </>
              )}
            </Badge>
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
                className={cn(
                  "border-transparent rounded px-2",
                  isHighPain
                    ? "bg-red-100 text-red-700"
                    : "bg-teal-50 text-teal-700",
                )}
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

            {/* Actions */}
            <div className="flex gap-1 relative z-10">
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  onHistory?.(patient);
                }}
                icon={<History className="w-4 h-4" />}
                className="hover:text-blue-600"
                title="Medical History"
              />
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  onVitals?.(patient);
                }}
                icon={<Activity className="w-4 h-4" />}
                className="hover:text-orange-600"
                title="Update Vitals"
              />
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(patient);
                }}
                icon={<Pencil className="w-4 h-4" />}
                className="hover:text-teal-600"
                title="Edit Details"
              />
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(patient);
                }}
                icon={<Trash2 className="w-4 h-4" />}
                className="hover:text-red-600"
                title="Delete"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const ActionButton = ({ onClick, icon, className }) => (
  <button
    onPointerDown={(e) => e.stopPropagation()}
    onClick={onClick}
    className={cn(
      "p-1.5 text-gray-400 hover:bg-gray-50 rounded-md transition-colors cursor-pointer",
      className,
    )}
  >
    {icon}
  </button>
);
