"use client";

import React from "react";
import { Card } from "@/components";

export function StatusCard({ title, subtitle, count, className = "" }) {
  return (
    <Card
      className={`p-4 flex flex-row justify-between items-center shadow-sm border-gray-300 ${className}`}
    >
      <div>
        <h2 className="font-semibold text-lg sm:text-xl text-[#000000] capitalize">
          {title}
        </h2>
        <p className="text-xs text-gray-500 font-normal">{subtitle}</p>
      </div>
      <span className="sm:text-xl text-lg font-bold text-[#000000]">
        {count}
      </span>
    </Card>
  );
}
