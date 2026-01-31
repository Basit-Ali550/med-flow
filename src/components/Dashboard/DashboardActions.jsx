import React from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export function DashboardActions({
  searchQuery,
  onSearchChange,
  onAddClick,
  searchPlaceholder = "Search Patients...",
  buttonLabel = "Add Patient",
  className = "",
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row justify-end gap-4 mb-8 ${className}`}
    >
      <div className="relative w-full sm:w-80 group">
        <Input
          placeholder={searchPlaceholder}
          className="pr-10 rounded-full border-gray-200 shadow-sm focus-visible:ring-teal-500 transition-all duration-300 group-hover:border-teal-300"
          value={searchQuery}
          onChange={onSearchChange}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors">
          <Search className="w-4 h-4" />
        </div>
      </div>
      <Button
        onClick={onAddClick}
        className="rounded-full bg-teal-600 hover:bg-teal-700 px-6 shadow-md shadow-teal-600/20 cursor-pointer active:scale-95 transition-all text-white font-semibold"
      >
        <Plus className="w-4 h-4 mr-2" />
        {buttonLabel}
      </Button>
    </div>
  );
}
