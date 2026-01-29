"use client";

import React from "react";
import SectionHeader from "../SectionHeader/SectionHeader";
import PatientCard from "../PatientCard/PatientCard";

const DropZone = ({ patients = [], title, onDrop, onEdit, onDelete }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-teal-400", "bg-teal-50");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("border-teal-400", "bg-teal-50");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-teal-400", "bg-teal-50");
    onDrop?.();
  };

  return (
    <div>
      <SectionHeader count={patients.length} title={title} />

      {patients.length > 0 ? (
        <div className="space-y-4">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 transition-all duration-200"
        >
          <p className="text-center text-gray-400 text-lg">
            Drag patients here for Triage
          </p>
        </div>
      )}
    </div>
  );
};

export default DropZone;
