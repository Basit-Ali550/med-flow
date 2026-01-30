"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatusCard({ icon, title, subtitle, count, theme = "default", className = "" }) {

  const themeStyles = {
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
    default: "bg-gray-50 text-gray-600",
  };

  return (
    <Card className={cn("p-6 flex items-center justify-between border-gray-100 shadow-sm", className)}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", themeStyles[theme] || themeStyles.default)}>
            {icon}
          </div>
        )}
        <div>
          {count !== undefined && (
            <h3 className="text-3xl font-bold text-gray-900 mb-0.5">{count}</h3>
          )}
          <div className={cn("font-medium", count ? "text-sm text-gray-500" : "text-lg text-gray-900")}>
            {title}
            {subtitle && <span className="block text-xs text-gray-400 font-normal mt-0.5">{subtitle}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}
