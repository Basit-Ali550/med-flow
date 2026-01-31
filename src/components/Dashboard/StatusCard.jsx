"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Clock, Stethoscope, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusCard({
  title,
  subtitle,
  count,
  criticalCount,
  className = "",
}) {
  const isUnscheduled = title.toLowerCase().includes("unscheduled");

  // Design configuration based on type
  const config = isUnscheduled
    ? {
        icon: Clock,
        iconBg: "bg-orange-500",
        iconColor: "text-white",
        badgeBg: "bg-orange-50",
        badgeColor: "text-orange-700",
        borderColor: "border-gray-200",
      }
    : {
        icon: Stethoscope,
        iconBg: "bg-teal-500",
        iconColor: "text-white",
        badgeBg: "bg-teal-50",
        badgeColor: "text-teal-700",
        borderColor: "border-gray-200", // Kept neutral/white as requested
      };

  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "p-4 flex-row items-center justify-between border shadow-sm bg-white w-full",
        className,
      )}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Icon Box */}
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm shrink-0",
            config.iconBg,
            config.iconColor,
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Text Content */}
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900 capitalize text-base truncate">
            {title}
          </h2>
          <p className="text-xs text-gray-400 font-medium truncate">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        <div
          className={cn(
            "px-3 py-1 rounded-md font-bold text-lg",
            config.badgeBg,
            config.badgeColor,
          )}
        >
          {count}
        </div>
      </div>
    </Card>
  );
}
