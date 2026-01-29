"use client";

import React from "react";

const Button = ({ children, onClick, variant = "primary", icon }) => {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "8px",
    fontWeight: "500",
    fontSize: "16px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const variants = {
    primary: {
      backgroundColor: "var(--color-primary)",
      color: "var(--color-text-white)",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
    secondary: {
      backgroundColor: "var(--color-border-light)",
      color: "var(--color-text-secondary)",
    },
    danger: {
      backgroundColor: "var(--color-delete-hover)",
      color: "var(--color-text-white)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-text-secondary)",
    },
  };

  const style = { ...baseStyle, ...variants[variant] };

  return (
    <button onClick={onClick} style={style}>
      {icon && (
        <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;
