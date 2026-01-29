"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PatientCard } from "./PatientCard";

export function SortablePatientCard({ patient, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: patient._id, data: { patient } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3 touch-none">
      <PatientCard
        patient={patient}
        onEdit={(p) => onEdit(p)}
        onDelete={(p) => onDelete(p)}
        // Pass drag props for the whole card
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
