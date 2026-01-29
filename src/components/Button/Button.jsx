"use client";

import React from "react";

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon,
}) => {
  const variants = {
    primary:
      "bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "hover:bg-gray-100 text-gray-600",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all duration-200 ${variants[variant]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
