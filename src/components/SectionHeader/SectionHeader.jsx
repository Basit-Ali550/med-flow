"use client";

import React from "react";

const SectionHeader = ({ count, title }) => {
  const styles = {
    wrapper: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "16px",
    },
    count: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "32px",
      height: "32px",
      borderRadius: "8px",
      backgroundColor: "var(--color-badge-count-bg)",
      color: "var(--color-badge-count-text)",
      fontWeight: "600",
      fontSize: "14px",
    },
    title: {
      color: "var(--color-text-secondary)",
      fontWeight: "500",
      fontSize: "16px",
    },
  };

  return (
    <div style={styles.wrapper}>
      <span style={styles.count}>{count}</span>
      <h2 style={styles.title}>{title}</h2>
    </div>
  );
};

export default SectionHeader;
