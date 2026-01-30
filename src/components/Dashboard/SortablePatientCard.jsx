"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PatientCard } from "./PatientCard";
import { TriagedPatientCard } from "./TriagedPatientCard";

export function SortablePatientCard({
  patient,
  onEdit,
  onDelete,
  onHistory,
  onVitals,
  onClick,
  useTriagedCard = false,
}) {
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

  const CardComponent = useTriagedCard ? TriagedPatientCard : PatientCard;

  return (
    <div ref={setNodeRef} style={style} className="mb-3 touch-none">
      <CardComponent
        patient={patient}
        onEdit={(p) => onEdit?.(p)}
        onDelete={(p) => onDelete?.(p)}
        onHistory={(p) => onHistory?.(p)}
        onVitals={(p) => onVitals?.(p)}
        onClick={(p) => onClick?.(p)}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
