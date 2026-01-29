"use client";

import React from "react";

const Badge = ({ children, variant = "default", className = "" }) => {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    gap: "4px",
  };

  const variants = {
    default: {
      backgroundColor: "var(--color-border-light)",
      color: "var(--color-text-secondary)",
    },
    pain: {
      backgroundColor: "var(--color-pain-bg)",
      color: "var(--color-pain-text)",
    },
    waitTime: {
      backgroundColor: "var(--color-wait-bg)",
      color: "var(--color-wait-text)",
    },
    count: {
      backgroundColor: "var(--color-badge-count-bg)",
      color: "var(--color-badge-count-text)",
    },
    vitalsProvided: {
      color: "var(--color-vitals-provided)",
      border: "1px solid var(--color-vitals-provided)",
      backgroundColor: "var(--color-bg-white)",
    },
    missingVitals: {
      color: "var(--color-vitals-missing)",
      border: "1px solid var(--color-vitals-missing)",
      backgroundColor: "var(--color-bg-white)",
    },
  };

  const style = { ...baseStyle, ...variants[variant] };

  return <span style={style}>{children}</span>;
};

export default Badge;
