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
} from "lucide-react";

export function AIAnalysisModal({ isOpen, onClose, patient }) {
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
        
        Return a VALID JSON object with the following fields:
        1. "score": A number between 0-100 indicating urgency (100 = Critical/Immediate).
        2. "reasoning": A concise, professional clinical explanation (3-4 sentences) justifying the score based on symptoms and vitals.
        
        Respond ONLY with the JSON.
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
            model: "gpt-4o-mini", // or gpt-3.5-turbo if preferred
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful medical assistant. Output JSON only.",
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
      setAnalysis(result);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError(
        "Failed to generate clinical analysis. Please review vitals manually.",
      );
    } finally {
      setLoading(false);
    }
  }, [patient]);

  useEffect(() => {
    if (isOpen && patient) {
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
        className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl gap-0"
      >
        {!loading && !error && (
          <div className="bg-teal-700 p-5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-teal-200" />
              AI Clinical Assessment
            </h2>
            <button
              onClick={onClose}
              className="text-teal-100 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-[6px] border-teal-50 border-t-teal-600 rounded-full animate-spin"></div>
                <BrainCircuit className="w-8 h-8 text-teal-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">
                  Analyzing Patient Data...
                </p>
                <p className="text-gray-500 mt-1">
                  Generating clinical insights and triage score
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
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
            <div className="flex flex-col gap-8">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {patient.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 font-semibold mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase">
                      {patient.gender}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{patient.age || "N/A"} Years Old</span>
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl px-6 py-3 text-center shadow-sm">
                  <div className="text-4xl font-black text-amber-700 leading-none">
                    {analysis.score}
                    <span className="text-base text-amber-600 font-bold ml-0.5">
                      /100
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-800 font-extrabold uppercase tracking-widest mt-1">
                    Urgency Score
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-teal-50 text-teal-700 border-teal-100 px-4 py-1.5 text-sm font-bold rounded-full"
                >
                  Pain Level: {patient.painLevel}/10
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-100 px-4 py-1.5 text-sm font-bold rounded-full"
                >
                  Wait Time: {patient.waitTime || "0"}m
                </Badge>
              </div>

              {/* Main Content Sections */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* AI Reasoning */}
                <div className="md:col-span-3 bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <BrainCircuit className="w-24 h-24" />
                  </div>
                  <h4 className="text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase mb-4">
                    Clinical Reasoning & Priority
                  </h4>
                  <p className="text-slate-800 leading-relaxed font-semibold text-base relative z-10">
                    {analysis.reasoning}
                  </p>
                </div>

                {/* Vitals Snapshot */}
                <div className="md:col-span-2 bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-gray-400 font-black text-[10px] tracking-[0.2em] uppercase mb-5">
                    Live Vitals Data
                  </h4>

                  <div className="space-y-4">
                    <VitalItem
                      icon={<Heart className="w-4 h-4 text-rose-500" />}
                      label="Heart Rate"
                      value={patient.vitalSigns?.heartRate}
                      unit="BPM"
                    />
                    <VitalItem
                      icon={<Activity className="w-4 h-4 text-blue-500" />}
                      label="Blood Pressure"
                      value={`${patient.vitalSigns?.bloodPressureSys || "--"}/${patient.vitalSigns?.bloodPressureDia || "--"}`}
                    />
                    <VitalItem
                      icon={<Thermometer className="w-4 h-4 text-orange-500" />}
                      label="Temperature"
                      value={patient.vitalSigns?.temperature}
                      unit="°C"
                    />
                    <VitalItem
                      icon={<Wind className="w-4 h-4 text-sky-500" />}
                      label="O2 Saturation"
                      value={patient.vitalSigns?.o2Saturation}
                      unit="%"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-2">
                <p className="text-[10px] text-gray-400 font-medium max-w-[300px]">
                  *AI assessments are for guidance only. Please verify with
                  physical clinical observation.
                </p>
                <Button
                  onClick={onClose}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-10 h-11 font-bold shadow-lg shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  Dismiss Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VitalItem({ icon, label, value, unit = "" }) {
  const displayValue =
    value === undefined || value === null || value === "" ? "--" : value;
  return (
    <div className="flex justify-between items-center group">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors shadow-sm border border-transparent group-hover:border-gray-100">
          {icon}
        </div>
        <span className="font-bold text-sm text-gray-600">{label}</span>
      </div>
      <div className="text-right">
        <span className="font-black text-gray-900 text-base">
          {displayValue}
        </span>
        {unit && value && (
          <span className="text-[10px] text-gray-400 ml-1 font-bold uppercase">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
