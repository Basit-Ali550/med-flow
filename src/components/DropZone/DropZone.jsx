"use client";

import React, { useState } from "react";
import SectionHeader from "../SectionHeader/SectionHeader";
import PatientCard from "../PatientCard/PatientCard";

const DropZone = ({ patients = [], title, onDrop, onEdit, onDelete }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const styles = {
    list: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    dropZone: {
      border: `2px dashed ${isDragOver ? "var(--color-primary-light)" : "var(--color-border-dashed)"}`,
      borderRadius: "12px",
      padding: "48px 16px",
      transition: "all 0.2s ease",
      backgroundColor: isDragOver ? "var(--color-primary-50)" : "transparent",
    },
    dropText: {
      textAlign: "center",
      color: "var(--color-text-muted)",
      fontSize: "18px",
    },
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop?.();
  };

  return (
    <div>
      <SectionHeader count={patients.length} title={title} />

      {patients.length > 0 ? (
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
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={styles.dropZone}
        >
          <p style={styles.dropText}>Drag patients here for Triage</p>
        </div>
      )}
    </div>
  );
};

export default DropZone;
