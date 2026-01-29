"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const PatientCard = ({ patient, onEdit, onDelete, draggable = true }) => {
  const { name, age, gender, symptoms, painLevel, waitTime, vitalsProvided } =
    patient;

  const styles = {
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: "16px",
    },
    leftSection: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
    },
    dragHandle: {
      marginTop: "4px",
      cursor: "grab",
      color: "var(--color-text-muted)",
    },
    patientInfo: {
      flex: 1,
    },
    nameRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "4px",
    },
    name: {
      fontWeight: "600",
      color: "var(--color-text-primary)",
      fontSize: "18px",
    },
    demographics: {
      color: "var(--color-text-secondary)",
      fontSize: "14px",
    },
    symptoms: {
      color: "var(--color-text-secondary)",
      fontSize: "14px",
      marginBottom: "12px",
    },
    symptomsLabel: {
      fontWeight: "500",
    },
    badges: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flexWrap: "wrap",
    },
    rightSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "12px",
    },
    actions: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
  };

  return (
    <Card
      className="shadow-sm hover:shadow-md transition-shadow"
      draggable={draggable}
    >
      <div style={styles.cardContent}>
        {/* Left Section */}
        <div style={styles.leftSection}>
          {/* Drag Handle */}
          {draggable && (
            <div style={styles.dragHandle}>
              <GripVertical className="w-5 h-5" />
            </div>
          )}

          {/* Patient Info */}
          <div style={styles.patientInfo}>
            <div style={styles.nameRow}>
              <h3 style={styles.name}>{name}</h3>
              <span style={styles.demographics}>
                ({age}y, {gender})
              </span>
            </div>

            <p style={styles.symptoms}>
              <span style={styles.symptomsLabel}>Symptoms:</span> {symptoms}
            </p>

            {/* Badges - Using Shadcn Badge */}
            <div style={styles.badges}>
              <Badge className="bg-red-500 text-white hover:bg-red-600 rounded-md">
                Pain: {painLevel}/10
              </Badge>
              <Badge className="bg-yellow-300 text-gray-800 hover:bg-yellow-400 rounded-md">
                Wait time: {waitTime} minutes
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div style={styles.rightSection}>
          {/* Vitals Status - Using Shadcn Badge */}
          {vitalsProvided ? (
            <Badge
              variant="outline"
              className="text-teal-600 border-teal-600 gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Vitals provided
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-red-500 border-red-500 gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              Missing Vitals
            </Badge>
          )}

          {/* Action Buttons - Using Shadcn Button */}
          <div style={styles.actions}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit?.(patient)}
              className="hover:text-teal-600 hover:bg-teal-50"
            >
              <Pencil className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete?.(patient)}
              className="hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PatientCard;
