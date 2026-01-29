"use client";

import React from "react";

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    pain: "bg-red-500 text-white",
    waitTime: "bg-yellow-300 text-gray-800",
    count: "bg-teal-100 text-teal-700",
    vitalsProvided: "text-teal-600 border border-teal-600 bg-white",
    missingVitals: "text-red-500 border border-red-500 bg-white",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
