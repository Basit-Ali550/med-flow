"use client";

import React from "react";
import PatientCard from "../PatientCard/PatientCard";
import SectionHeader from "../SectionHeader/SectionHeader";

const PatientList = ({ patients, title, onEdit, onDelete }) => {
  const styles = {
    list: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
  };

  return (
    <div>
      <SectionHeader count={patients.length} title={title} />
      <div style={styles.list}>
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
