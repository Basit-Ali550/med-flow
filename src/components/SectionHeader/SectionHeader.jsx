"use client";

import React from "react";

const SectionHeader = ({ count, title }) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-semibold text-sm">
        {count}
      </span>
      <h2 className="text-gray-600 font-medium">{title}</h2>
    </div>
  );
};

export default SectionHeader;
