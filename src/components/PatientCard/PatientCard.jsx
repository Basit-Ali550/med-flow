"use client";

import React, { useState } from "react";
import Badge from "../Badge/Badge";
import {
  DragHandleIcon,
  EditIcon,
  DeleteIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "../Icons/Icons";

const PatientCard = ({ patient, onEdit, onDelete, draggable = true }) => {
  const [editHover, setEditHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);

  const { name, age, gender, symptoms, painLevel, waitTime, vitalsProvided } =
    patient;

  const styles = {
    card: {
      backgroundColor: "var(--color-bg-white)",
      borderRadius: "12px",
      border: "1px solid var(--color-border)",
      padding: "16px",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      transition: "box-shadow 0.2s ease",
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
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
    dragIcon: {
      width: "20px",
      height: "20px",
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
    vitalsIcon: {
      width: "16px",
      height: "16px",
    },
    actions: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    editButton: {
      padding: "8px",
      background: editHover ? "var(--color-edit-hover-bg)" : "transparent",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      color: editHover
        ? "var(--color-edit-hover)"
        : "var(--color-text-secondary)",
      transition: "all 0.2s ease",
    },
    deleteButton: {
      padding: "8px",
      background: deleteHover ? "var(--color-delete-hover-bg)" : "transparent",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      color: deleteHover
        ? "var(--color-delete-hover)"
        : "var(--color-text-secondary)",
      transition: "all 0.2s ease",
    },
    actionIcon: {
      width: "20px",
      height: "20px",
    },
  };

  return (
    <div style={styles.card} draggable={draggable}>
      <div style={styles.cardContent}>
        {/* Left Section */}
        <div style={styles.leftSection}>
          {/* Drag Handle */}
          {draggable && (
            <div style={styles.dragHandle}>
              <DragHandleIcon style={styles.dragIcon} />
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

            {/* Badges */}
            <div style={styles.badges}>
              <Badge variant="pain">Pain: {painLevel}/10</Badge>
              <Badge variant="waitTime">Wait time: {waitTime} minutes</Badge>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div style={styles.rightSection}>
          {/* Vitals Status */}
          {vitalsProvided ? (
            <Badge variant="vitalsProvided">
              <CheckCircleIcon style={styles.vitalsIcon} />
              Vitals provided
            </Badge>
          ) : (
            <Badge variant="missingVitals">
              <AlertCircleIcon style={styles.vitalsIcon} />
              Missing Vitals
            </Badge>
          )}

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button
              onClick={() => onEdit?.(patient)}
              style={styles.editButton}
              onMouseEnter={() => setEditHover(true)}
              onMouseLeave={() => setEditHover(false)}
              aria-label="Edit patient"
            >
              <EditIcon style={styles.actionIcon} />
            </button>
            <button
              onClick={() => onDelete?.(patient)}
              style={styles.deleteButton}
              onMouseEnter={() => setDeleteHover(true)}
              onMouseLeave={() => setDeleteHover(false)}
              aria-label="Delete patient"
            >
              <DeleteIcon style={styles.actionIcon} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
