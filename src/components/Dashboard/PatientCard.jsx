"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, calculateAge, formatWaitTime } from "@/lib/utils";
import { PATIENT_STATUS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Trash2,
  History,
  Activity,
  Pin,
  BrainCircuit,
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
  onPin,
  onTriageChange,
  onAIAnalysis, // New prop
}) => {
  const [waitTimeDisplay, setWaitTimeDisplay] = useState(
    formatWaitTime(patient.registeredAt),
  );
  const ageDisplay = calculateAge(patient.dateOfBirth);

  // Check if patient has vitals
  const hasVitals =
    patient.vitalSigns &&
    (patient.vitalSigns.heartRate ||
      patient.vitalSigns.bloodPressureSys ||
      patient.vitalSigns.temperature ||
      patient.vitalSigns.o2Saturation);

  useEffect(() => {
    // Update wait time every minute
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
        {/* Grip Handle */}
        <div className="mt-1 text-gray-300 group-hover:text-teal-500 transition-colors">
          <span className="font-semibold text-gray-900 shrink-0">=</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
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
              {/* Pin Button */}
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

              {/* AI Score (Top Right for Scheduled/Triaged) */}
              {patient.aiAnalysis && patient.status !== "Waiting" && (
                <div
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-md border",
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

          {/* Priority Section */}
          <div className="flex justify-between items-start mb-2 min-h-[28px]">
            {/* Triage Level - Editable Dropdown (Only Visible for Scheduled/Triaged) */}
            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {onTriageChange && patient.status !== PATIENT_STATUS.WAITING ? (
                <Select
                  defaultValue={patient.triageLevel || "Semi-Urgent"}
                  onValueChange={(val) => onTriageChange(patient, val)}
                >
                  <SelectTrigger className="h-auto w-auto border-0 p-0 shadow-none focus:ring-0 data-placeholder:text-foreground bg-transparent">
                    <Badge
                      className={cn(
                        "text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity",
                        patient.triageLevel === "Critical" ||
                          patient.triageLevel === "Resuscitation" ||
                          patient.triageLevel === "Emergent"
                          ? "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                          : patient.triageLevel === "Urgent"
                            ? "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200"
                            : patient.triageLevel === "Semi-Urgent"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
                              : "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
                      )}
                    >
                      <SelectValue>
                        {patient.triageLevel || "Set Priority"}
                      </SelectValue>
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Semi-Urgent">Semi-Urgent</SelectItem>
                    <SelectItem value="Non-Urgent">Non-Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                /* Only show badge if NOT Waiting */
                patient.triageLevel &&
                patient.status !== PATIENT_STATUS.WAITING && (
                  <Badge variant="outline">{patient.triageLevel}</Badge>
                )
              )}
            </div>
          </div>

          {/* Symptoms */}
          <div className="text-sm text-gray-600 mb-3 flex gap-2">
            <span className="font-semibold text-gray-700 shrink-0">
              Symptoms:
            </span>
            <span className="line-clamp-2 break-words">{patient.symptoms}</span>
          </div>

          {/* Vitals Missing Badge - Only for unscheduled patients without vitals */}
          {!hasVitals && patient.status === PATIENT_STATUS.WAITING && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVitals?.(patient);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-md text-xs font-medium hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              Vitals missing
            </button>
          )}
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
                Wait: {waitTimeDisplay}
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
              {/* View AI Analysis Button - Only if analysis exists or status is triaged */}
              {(patient.aiAnalysis || patient.status === "Triaged") && (
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();

                    if (onAIAnalysis) {
                      onAIAnalysis(patient);
                    } else if (onClick) {
                      onClick(patient);
                    }
                  }}
                  icon={<BrainCircuit className="w-4 h-4" />}
                  className="hover:text-purple-600"
                  title="View AI Analysis"
                />
              )}
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
