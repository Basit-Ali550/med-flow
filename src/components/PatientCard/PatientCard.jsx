"use client";

import React from "react";
import Badge from "../Badge/Badge";
import {
  DragHandleIcon,
  EditIcon,
  DeleteIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "../Icons/Icons";

const PatientCard = ({ patient, onEdit, onDelete, draggable = true }) => {
  const { name, age, gender, symptoms, painLevel, waitTime, vitalsProvided } =
    patient;

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
      draggable={draggable}
    >
      <div className="flex items-start justify-between">
        {/* Left Section */}
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          {draggable && (
            <div className="mt-1 cursor-grab text-gray-400 hover:text-gray-600">
              <DragHandleIcon className="w-5 h-5" />
            </div>
          )}

          {/* Patient Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
              <span className="text-gray-500 text-sm">
                ({age}y, {gender})
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-3">
              <span className="font-medium">Symptoms:</span> {symptoms}
            </p>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="pain">Pain: {painLevel}/10</Badge>
              <Badge variant="waitTime">Wait time: {waitTime} minutes</Badge>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end gap-3">
          {/* Vitals Status */}
          {vitalsProvided ? (
            <Badge variant="vitalsProvided" className="flex items-center gap-1">
              <CheckCircleIcon className="w-4 h-4" />
              Vitals provided
            </Badge>
          ) : (
            <Badge variant="missingVitals" className="flex items-center gap-1">
              <AlertCircleIcon className="w-4 h-4" />
              Missing Vitals
            </Badge>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit?.(patient)}
              className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              aria-label="Edit patient"
            >
              <EditIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete?.(patient)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete patient"
            >
              <DeleteIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
