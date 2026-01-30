"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Stethoscope,
  Activity,
  CheckCircle2,
  Calendar,
  FileText,
} from "lucide-react";

export function AIAnalysisViewModal({ isOpen, onClose, patient }) {
  if (!isOpen || !patient || !patient.aiAnalysis) return null;

  const { aiAnalysis } = patient;
  const { score, triageLevel, reasoning, recommendedActions, timestamp } =
    aiAnalysis;

  // Formatting date
  const analysisDate = timestamp
    ? new Date(timestamp).toLocaleString()
    : "Unknown";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[800px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl gap-0 z-100"
      >
        <DialogTitle className="sr-only">AI Analysis Record</DialogTitle>

        {/* Header - Distinct from Generation Modal (e.g. Blue/Indigo instead of Teal) */}
        <div className="bg-[#0D9488] p-4 flex justify-between items-center px-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-200" />
            Clinical Analysis Record
          </h2>
          <button
            onClick={onClose}
            className="text-indigo-100 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
          {/* Top Row: Score & Time */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {patient.fullName}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Analysis Generated: {analysisDate}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-indigo-50 px-5 py-3 rounded-xl border border-indigo-100">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Urgency Score
                </div>
                <div className="text-lg font-bold text-[#0D9488]">
                  {triageLevel}
                </div>
              </div>
              <div className="h-8 w-px bg-indigo-200"></div>
              <div className="text-4xl font-black text-[#0D9488]">{score}</div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Reasoning */}
            <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden">
              <div className="bg-green-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Clinical Reasoning
                </span>
              </div>
              <div className="p-5 bg-green-50 text-gray-700 leading-relaxed">
                {reasoning}
              </div>
            </div>

            {/* Recommendations */}
            <div
              className="bg-pur
             rounded-xl border border-purple-200 shadow-sm overflow-hidden"
            >
              <div className="bg-purple-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Recommended Actions
                </span>
              </div>
              <div className="p-2">
                {recommendedActions && recommendedActions.length > 0 ? (
                  recommendedActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-700 font-medium pt-0.5">
                        {action}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-gray-400 italic text-sm">
                    No actions recorded.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold border border-gray-200 shadow-sm"
            >
              Close Record
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
