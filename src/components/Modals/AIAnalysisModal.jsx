"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  X,
  BrainCircuit,
  CheckCircle2,
  Stethoscope,
  Activity,
} from "lucide-react";

export function AIAnalysisModal({
  isOpen,
  onClose,
  patient,
  onAnalysisComplete,
}) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const generateAnalysis = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_VITE_OPENAI_API_KEY;

    if (!apiKey) {
      setError("AI Service Configuration missing (API Key).");
      setLoading(false);
      return;
    }

    try {
      const prompt = `
        You are an expert Triage Nurse Assistant. Analyze the following patient data and provide a triage assessment.
        
        Patient Data:
        - Age: ${patient.age || "Unknown"}
        - Gender: ${patient.gender || "Unknown"}
        - Symptoms: ${patient.symptoms}
        - Pain Level: ${patient.painLevel}/10
        - Vitals: ${patient.vitalSigns ? JSON.stringify(patient.vitalSigns) : "Not provided"}
        - Medical History: ${patient.medicalHistory || "None"}
        
        Return a VALID JSON object with the following fields:
        1. "score": A number between 0-100 indicating urgency (100 = Critical/Immediate).
        2. "triageLevel": One of ["Critical", "Urgent", "Semi-Urgent", "Non-Urgent"].
        3. "reasoning": A concise, professional clinical explanation (3-4 sentences) justifying the score.
        4. "recommendedActions": An array of 3-5 specific, short clinical actions (e.g., "Administer 500mg Paracetamol", "Order ECG", "Monitor BP every 15m").
        
        Respond ONLY with the JSON. Do not include markdown formatting.
      `;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful medical assistant. Output raw JSON only. Ensure the 'score' field is always included as a number.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.5,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to contact AI service");
      }

      const data = await response.json();
      let content = data.choices[0].message.content;

      // Clean code blocks if present
      content = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const result = JSON.parse(content);
      if (result.score === undefined || result.score === null) {
        result.score = 0; // Fallback to 0 if missing
      }

      // Auto-Map Valid Enums for Mongoose Persistence
      const validLevels = ["Critical", "Urgent", "Semi-Urgent", "Non-Urgent"];
      if (!validLevels.includes(result.triageLevel)) {
        // Robust Fallback mapping
        if (result.triageLevel === "Less Urgent")
          result.triageLevel = "Semi-Urgent";
        else if (result.triageLevel === "Emergent")
          result.triageLevel = "Urgent";
        else if (result.triageLevel === "Resuscitation")
          result.triageLevel = "Critical";
        else result.triageLevel = "Non-Urgent";
      }

      setAnalysis(result);

      // Auto-save: Persist to DB immediately
      if (onAnalysisComplete) {
        onAnalysisComplete({
          ...patient,
          triageLevel: result.triageLevel,
          aiAnalysis: {
            score: result.score,
            triageLevel: result.triageLevel,
            reasoning: result.reasoning,
            recommendedActions: result.recommendedActions || [],
          },
        });
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError(
        "Failed to generate clinical analysis. Please review vitals manually.",
      );
    } finally {
      setLoading(false);
    }
  }, [patient, onAnalysisComplete]);

  useEffect(() => {
    if (isOpen && patient) {
      // Improved check: Use optional chaining and check against null/undefined explicitly
      // to handle score = 0 cases.
      // Force re-analysis every time the modal is opened
      console.log("Starting new analysis...");
      generateAnalysis();
    } else {
      // Reset state when closed
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
        className="sm:max-w-[900px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-xl gap-0 z-100"
      >
        <DialogTitle className="sr-only">AI Clinical Assessment</DialogTitle>
        {!loading && !error && (
          <div className="bg-teal-700 p-4 flex justify-between items-center px-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-teal-200" />
              AI Clinical Assessment
            </h2>
            <button
              onClick={onClose}
              className="text-teal-100 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 px-8 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 border-[6px] border-teal-50 border-t-teal-600 rounded-full animate-spin"></div>
                <BrainCircuit className="w-8 h-8 text-teal-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  Analyzing Patient Data...
                </p>
                <p className="text-gray-500 mt-2 text-sm">
                  Generating triage score, clinical reasoning, and recommended
                  actions.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 px-6">
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block mb-6 max-w-md border border-red-100 italic">
                {error}
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="rounded-full px-8 cursor-pointer border-gray-200"
                >
                  Close Analysis
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row h-full min-h-[500px]">
              {/* LEFT COLUMN: Patient Context (40%) */}
              <div className="md:w-[35%] bg-gray-50 border-r border-gray-100 p-6 flex flex-col gap-4">
                {/* Identity */}
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-teal-700">
                      {patient.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {patient.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                      {patient.age || "N/A"} Years • {patient.gender}
                    </p>
                    {/* Pain & Wait - Below Age/Gender */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border",
                          (patient.painLevel || 0) <= 4
                            ? "bg-green-50 text-green-700 border-green-200"
                            : (patient.painLevel || 0) <= 7
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200",
                        )}
                      >
                        Pain: {patient.painLevel}/10
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-white text-gray-600 border-gray-200"
                      >
                        Wait: {patient.waitTime || 0}m
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Symptoms Section */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-auto">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Symptoms
                  </h4>
                  <p className="text-gray-800 text-sm font-medium leading-relaxed">
                    {patient.symptoms}
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: AI Analysis & Vitals (60%) */}
              <div className="md:w-[65%] p-6 bg-white overflow-y-auto max-h-[80vh]">
                {/* Top Section: Score & Triage Level */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-teal-600" />
                      Clinical Assessment
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      AI-Generated Triage Recommendation
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-3 mb-1">
                      <span
                        className={cn(
                          "text-3xl font-black",
                          (analysis.score ?? 0) <= 39
                            ? "text-green-600"
                            : (analysis.score ?? 0) <= 79
                              ? "text-yellow-600"
                              : "text-red-600",
                        )}
                      >
                        {analysis.score}
                      </span>
                      <div className="h-8 w-[2px] bg-gray-200"></div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Urgency
                        </div>
                        <div className="text-sm font-bold text-teal-600">
                          {analysis.triageLevel}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Reasoning */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Analysis Reasoning
                    </h5>
                    <p className="text-slate-800 text-sm leading-relaxed font-medium">
                      {analysis.reasoning}
                    </p>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-teal-500" />{" "}
                      Recommended Actions
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {analysis.recommendedActions &&
                      analysis.recommendedActions.length > 0 ? (
                        analysis.recommendedActions.map((action, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-teal-100 transition-colors"
                          >
                            <span className="shrink-0 w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-gray-700 font-medium">
                              {action}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          No specific actions recommended.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Live VitalsRow */}
                  <div className="pt-4 border-t border-gray-100">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      Patient Vitals
                    </h5>
                    <div className="grid grid-cols-4 gap-2">
                      <CompactVital
                        label="HR"
                        value={patient.vitalSigns?.heartRate}
                        unit="bpm"
                        type="HR"
                      />
                      <CompactVital
                        label="BP"
                        value={`${patient.vitalSigns?.bloodPressureSys || "--"}/${patient.vitalSigns?.bloodPressureDia || "--"}`}
                        valSys={patient.vitalSigns?.bloodPressureSys}
                        type="BP"
                      />
                      <CompactVital
                        label="Temp"
                        value={patient.vitalSigns?.temperature}
                        unit="°F"
                        type="Temp"
                      />
                      <CompactVital
                        label="O2"
                        value={patient.vitalSigns?.o2Saturation}
                        unit="%"
                        type="O2"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex justify-end relative z-200">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent bubbling
                      console.log("Acknowledge clicked");
                      if (onAnalysisComplete) {
                        onAnalysisComplete({
                          ...patient,
                          triageLevel: analysis.triageLevel, // Update top-level triage
                          aiAnalysis: {
                            score: analysis.score,
                            triageLevel: analysis.triageLevel,
                            reasoning: analysis.reasoning,
                            recommendedActions:
                              analysis.recommendedActions || [],
                          },
                        });
                      }
                      onClose();
                    }}
                    className="bg-[#0D9488]  text-white rounded-full px-6 py-2 h-10 text-sm font-bold shadow-lg transition-all cursor-pointer pointer-events-auto"
                  >
                    Acknowledge Assessment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CompactVital({ label, value, unit, type, valSys }) {
  let colorClass = "text-gray-900";

  if (value && value !== "--") {
    const num = parseFloat(value); // For BP this might be NaN, handled below

    if (type === "HR") {
      if (num < 60 || num > 100) colorClass = "text-red-600";
      else colorClass = "text-green-600";
    } else if (type === "Temp") {
      if (num < 97.7 || num > 99.5) colorClass = "text-red-600";
      else colorClass = "text-green-600";
    } else if (type === "O2") {
      if (num < 90) colorClass = "text-red-600";
      else if (num < 95) colorClass = "text-yellow-600";
      else colorClass = "text-green-600";
    } else if (type === "BP") {
      // Use systolic value passed separately
      const sys = parseFloat(valSys);
      if (!isNaN(sys)) {
        if (sys >= 140 || sys < 90) colorClass = "text-red-600";
        else if (sys >= 120) colorClass = "text-yellow-600";
        else colorClass = "text-green-600";
      }
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
      <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">
        {label}
      </div>
      <div className={cn("text-sm font-bold truncate", colorClass)}>
        {value || "--"}{" "}
        <span className="text-[9px] font-normal text-gray-400">{unit}</span>
      </div>
    </div>
  );
}
