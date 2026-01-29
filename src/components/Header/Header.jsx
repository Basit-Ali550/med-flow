"use client";

import React from "react";

const Header = () => {
  const styles = {
    header: {
      backgroundColor: "var(--color-primary)",
      color: "var(--color-text-white)",
      padding: "16px 24px",
    },
    container: {
      maxWidth: "1280px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logoWrapper: {
      display: "flex",
      alignItems: "center",
    },
    logo: {
      backgroundColor: "var(--color-bg-white)",
      borderRadius: "9999px",
      padding: "8px 12px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      display: "flex",
      alignItems: "center",
      gap: "2px",
    },
    logoMed: {
      color: "var(--color-primary)",
      fontWeight: "700",
      fontSize: "14px",
    },
    logoFlow: {
      color: "var(--color-primary-light)",
      fontWeight: "700",
      fontSize: "14px",
    },
    titleWrapper: {
      textAlign: "center",
    },
    title: {
      fontSize: "28px",
      fontWeight: "600",
      letterSpacing: "0.025em",
    },
    subtitle: {
      color: "var(--color-primary-100)",
      fontSize: "14px",
      marginTop: "4px",
    },
    menuButton: {
      padding: "8px",
      background: "transparent",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      color: "var(--color-text-white)",
    },
    menuIcon: {
      width: "32px",
      height: "32px",
    },
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoWrapper}>
          <div style={styles.logo}>
            <span style={styles.logoMed}>Med</span>
            <span style={styles.logoFlow}>Flow</span>
          </div>
        </div>

        {/* Title */}
        <div style={styles.titleWrapper}>
          <h1 style={styles.title}>Triage Dashboard</h1>
          <p style={styles.subtitle}>Manage patients in the ER</p>
        </div>

        {/* Menu Icon */}
        <button style={styles.menuButton}>
          <svg
            style={styles.menuIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
