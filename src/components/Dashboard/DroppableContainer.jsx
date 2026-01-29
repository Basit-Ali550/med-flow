"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function DroppableContainer({ id, children, className }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "ring-2 ring-teal-500 bg-teal-50/50" : ""}`}
    >
      {children}
    </div>
  );
}
