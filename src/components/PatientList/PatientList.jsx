"use client";

import React from "react";
import PatientCard from "../PatientCard/PatientCard";
import SectionHeader from "../SectionHeader/SectionHeader";

const PatientList = ({ patients, title, onEdit, onDelete }) => {
  return (
    <div>
      <SectionHeader count={patients.length} title={title} />
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
    </div>
  );
};

export default PatientList;
