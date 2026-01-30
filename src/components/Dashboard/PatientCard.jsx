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
  onAIAnalysis, // New prop
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

              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-2 py-0.5 font-medium flex gap-1 items-center whitespace-nowrap",
                  hasVitals
                    ? "bg-teal-50 text-teal-600 border-teal-200"
                    : "bg-red-50 text-red-500 border-red-200",
                )}
              >
                {hasVitals ? (
                  <>
                    <CheckCircle className="w-3 h-3" /> Vitals
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" /> No Vitals
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* AI Analysis Snapshot (If Available) - Hide for Waiting/Unscheduled */}
          {patient.aiAnalysis && patient.status !== "Waiting" && (
            <div className="mb-3 py-3 b rounded-lg">
              <div className="flex justify-between items-center pb-2">
                {patient.aiAnalysis.triageLevel && (
                  <div className="mb-2">
                    <Badge
                      className={cn(
                        "text-[10px] font-bold uppercase",
                        patient.aiAnalysis.score > 80
                          ? "bg-red-100 text-red-800 hover:bg-red-100"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-100",
                      )}
                    >
                      {patient.aiAnalysis.triageLevel}
                    </Badge>
                  </div>
                )}
                <div
                  className={cn(
                    "text-xs font-bold p-1 rounded-md border",
                    (patient.aiAnalysis.score ?? 0) > 50
                      ? "bg-[#FFF0F2] border-[#F0000F] text-[#F0000F]"
                      : "bg-[#FFF9BC] border-[#FFE33A] text-[#B89F00]", // Darkened text for readability on light yellow
                  )}
                >
                  Ai Score:{" "}
                  <span className=" ">
                    {patient.aiAnalysis.score ?? "--"} /100
                  </span>
                </div>
              </div>

              {/* {patient.aiAnalysis.recommendedActions &&
                patient.aiAnalysis.recommendedActions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {patient.aiAnalysis.recommendedActions
                      .slice(0, 2)
                      .map((action, i) => (
                        <div
                          key={i}
                          className="flex gap-1.5 items-start text-[11px] text-slate-600 leading-tight"
                        >
                          <span className="text-teal-500 mt-0.5">•</span>
                          <span className="line-clamp-1">{action}</span>
                        </div>
                      ))}
                  </div>
                )} */}
            </div>
          )}

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
                    // We can reuse a prop for this, or generic onClick
                    // Let's assume onAIAnalysis prop or handle via onClick logic
                    if (onAIAnalysis) {
                      onAIAnalysis(patient);
                    } else if (onClick) {
                      onClick(patient); // Fallback to card click behavior which opens treatment/AI
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
