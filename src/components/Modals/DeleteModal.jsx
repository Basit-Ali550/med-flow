"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item?",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  isLoading = false,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-6 !rounded-3xl gap-0 overflow-hidden bg-white border-0 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {/* Icon Circle */}
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Trash2 className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>

          <DialogHeader className="mb-4 space-y-3">
            <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 font-medium leading-relaxed max-w-[300px] mx-auto">
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex w-full gap-3 mt-4 sm:justify-center sm:space-x-0">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-full border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold h-11 border-0"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold h-11"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
