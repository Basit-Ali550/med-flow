"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  X,
  Activity,
  Thermometer,
  Wind,
  Heart,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { toast } from "sonner";
import { cToF } from "@/lib/utils";

export function AIAnalysisModal({ isOpen, onClose, patient, onAnalysisComplete }) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const { updatePatient } = usePatients();
  const [isSaving, setIsSaving] = useState(false);

  const generateAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate analysis");
      }

      const result = await response.json();
      setAnalysis(result);

      // Auto-save logic
      handleAutoSave(result);

    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError("Failed to generate clinical analysis.");
      setLoading(false);
    }
  }, [patient]);

  const handleAutoSave = async (result) => {
    if (!patient?._id || !result) return;

    setIsSaving(true);
    try {
      // Robust payload preparation
      const updates = {
        aiAnalysis: result.reasoning || "Analysis pending...",
        recommendedActions: Array.isArray(result.recommendedActions)
          ? result.recommendedActions.join("\n")
          : (result.recommendedActions || ""),
        triageLevel: result.triageLevel,
        priority: result.priority,
      };

      const success = await updatePatient(patient._id, updates);

      if (success) {
        toast.success("Analysis saved to patient record");

        // Notify parent
        if (onAnalysisComplete) {
          onAnalysisComplete({ ...patient, ...updates });
        }

        setTimeout(() => {
          onClose();
        }, 2500);
      }
    } catch (err) {
      console.error("Save Error", err);
      toast.error("Analysis generated but failed to save.");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patient) {
      generateAnalysis();
    } else {
      setLoading(true);
      setAnalysis(null);
      setError(null);
    }
  }, [isOpen, patient, generateAnalysis]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-xl"
      >
        <div className="p-8 flex flex-col items-center text-center">
          {loading || isSaving ? (
            <>
              <div className="relative mb-6">
                <div className="w-20 h-20 border-[6px] border-teal-50 border-t-teal-600 rounded-full animate-spin"></div>
                <BrainCircuit className="w-8 h-8 text-teal-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {isSaving ? "Saving Analysis..." : "AI Analyzing..."}
              </h2>
              <p className="text-gray-500 text-sm">
                Please wait while our AI reviews patient history and vitals.
              </p>
            </>
          ) : error ? (
            <>
              <div className="bg-red-100 p-4 rounded-full mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Analysis Failed</h3>
              <p className="text-gray-500 text-sm mb-6">{error}</p>
              <Button onClick={onClose} variant="outline">Close</Button>
            </>
          ) : (
            <>
              <div className="bg-green-100 p-4 rounded-full mb-4 animate-in zoom-in">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Analysis Complete</h3>
              <p className="text-gray-500 text-sm mb-4">
                Triage Level: <span className="font-bold text-teal-700">{analysis.triageLevel}</span>
              </p>
              <p className="text-xs text-gray-400">
                Closing window...
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
