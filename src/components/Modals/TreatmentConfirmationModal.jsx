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
import { CheckCircle } from "lucide-react";

export function TreatmentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
}) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] flex flex-col items-center text-center p-8 gap-6">
        {/* Icon */}
        <div className="rounded-full bg-teal-50 p-3">
          <CheckCircle className="w-16 h-16 text-teal-500" strokeWidth={1.5} />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Patient sent to treatment room?
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-base leading-relaxed">
            Has the patient been sent to the treatment room? By clicking
            confirm, the patient will be removed from the queue.
          </DialogDescription>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full justify-center mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-32 rounded-full border-gray-200 hover:bg-gray-50 text-gray-700 h-10 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="w-32 rounded-full bg-teal-600 hover:bg-teal-700 text-white h-10 shadow-sm cursor-pointer"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
