"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, calculateAge, formatWaitTime } from "@/lib/utils";
import { PATIENT_STATUS } from "@/lib/constants";

import { Pencil, Trash2, History, Activity, Pin } from "lucide-react";

export const PatientCard = ({
  patient,
  onEdit,
  onDelete,
  onHistory,
  onVitals,
  onClick,
  dragHandleProps,
  isOverlay,
  onPin,
  onAIAnalysis, // New prop
}) => {
  const [waitTimeDisplay, setWaitTimeDisplay] = useState(
    formatWaitTime(patient.registeredAt),
  );
  const ageDisplay = calculateAge(patient.dateOfBirth);

  const hasVitals =
    patient.vitalSigns &&
    (patient.vitalSigns.heartRate ||
      patient.vitalSigns.bloodPressureSys ||
      patient.vitalSigns.temperature ||
      patient.vitalSigns.o2Saturation);

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
        "p-4 border shadow-sm rounded-lg transition-all group relative cursor-pointer active:cursor-grabbing hover:border-teal-400",
        isOverlay
          ? "shadow-2xl rotate-2 scale-105 bg-white border-teal-500"
          : "bg-white border-[#E4E4E4]",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-gray-300 group-hover:text-teal-500 transition-colors">
          <span className="font-semibold text-gray-900 shrink-0">=</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2 relative">
            <div>
              <h3 className="font-bold text-gray-900 text-base truncate pr-6">
                {patient.fullName}
                <span className="text-gray-400 font-normal text-sm ml-1">
                  ({ageDisplay}y, {patient.gender})
                </span>
              </h3>
            </div>

            <div className="flex gap-2 items-center">
              {onPin && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin(patient);
                  }}
                  className={cn(
                    "p-1 rounded-full transition-colors hover:bg-gray-100",
                    patient.isPinned
                      ? "text-teal-600 rotate-45"
                      : "text-gray-300 transform -rotate-45",
                  )}
                >
                  <Pin
                    className={cn(
                      "w-4 h-4",
                      patient.isPinned && "fill-current",
                    )}
                  />
                </button>
              )}

              {patient.status === PATIENT_STATUS.WAITING && !hasVitals && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVitals?.(patient);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-100 text-red-700 border border-red-600 rounded-md text-[10px] font-bold uppercase transition-colors hover:bg-red-200 cursor-pointer animate-pulse"
                >
                  <Activity className="w-3 h-3" />
                  Vitals missing
                </button>
              )}
              {patient.status !== PATIENT_STATUS.WAITING &&
                patient.aiAnalysis && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onAIAnalysis?.(patient);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-md border cursor-pointer hover:opacity-80 transition-opacity select-none",
                      (patient.aiAnalysis.score ?? 0) <= 39
                        ? "bg-green-50 border-green-300 text-green-700"
                        : (patient.aiAnalysis.score ?? 0) <= 79
                          ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                          : "bg-red-50 border-red-300 text-red-700",
                    )}
                  >
                    AI: <span>{patient.aiAnalysis.score ?? "--"}/100</span>
                  </div>
                )}
            </div>
          </div>

          {/* Priority Section - Static Badge Only (Dropdown Removed) */}

          {/* Symptoms (Restored) */}
          <div className="text-sm text-gray-600 mb-3 flex gap-2">
            <span className="font-semibold text-gray-700 shrink-0">
              Symptoms:
            </span>
            <span className="line-clamp-2 break-words">{patient.symptoms}</span>
          </div>
          {/* Footer Stats & Actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "border-transparent rounded px-2",
                  (patient.painLevel || 0) <= 4
                    ? "bg-green-50 text-green-700"
                    : (patient.painLevel || 0) <= 7
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700",
                )}
              >
                Pain: {patient.painLevel}/10
              </Badge>
              <Badge
                variant="secondary"
                className="bg-yellow-50 text-yellow-700 border-yellow-100 rounded px-2"
              >
                Waiting Time: {waitTimeDisplay}
              </Badge>
            </div>

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
