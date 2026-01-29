"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Activity, Thermometer, Wind, Heart } from "lucide-react";

export function AIAnalysisModal({ isOpen, onClose, patient }) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && patient) {
      generateAnalysis();
    } else {
      // Reset state when closed
      setLoading(true);
      setAnalysis(null);
      setError(null);
    }
  }, [isOpen, patient]);

  const generateAnalysis = async () => {
    const apiKey = process.env.NEXT_PUBLIC_VITE_OPENAI_API_KEY;

    if (!apiKey) {
      setError("Missing API Key");
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
      console.error(err);
      setError("Failed to generate analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl gap-0"
      >
        {/* Header (Only show if not loading for clean look, or always? Screenshot implies result view has header) */}
        {!loading && !error && (
          <div className="bg-teal-700 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              AI Triage Analysis
            </h2>
            <button
              onClick={onClose}
              className="text-teal-100 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-lg font-semibold text-gray-700 animate-pulse">
                AI Analysis running...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block mb-4">
                {error}
              </div>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Top Row: Name and Score */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {patient.fullName}
                  </h3>
                  <p className="text-gray-500 font-medium">
                    ({patient.age || "N/A"}y, {patient.gender})
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-center">
                  <div className="text-3xl font-bold text-yellow-700 leading-none">
                    {analysis.score}
                    <span className="text-lg text-yellow-600 font-medium">
                      /100
                    </span>
                  </div>
                  <div className="text-xs text-yellow-800 font-medium uppercase tracking-wide mt-1">
                    AI Score
                  </div>
                </div>
              </div>

              {/* Middle Row: Badges */}
              <div className="flex gap-3">
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1 text-sm font-medium"
                >
                  Pain: {patient.painLevel}/10
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1 text-sm font-medium"
                >
                  {/* We use a placeholder for wait time or calculate it if passed */}
                  Wait time: {patient.waitTime || "0"} minutes
                </Badge>
              </div>

              {/* Bottom Row: Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Reasoning Column (3/5) */}
                <div className="md:col-span-3 bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="text-gray-400 font-bold text-sm tracking-wide uppercase mb-3">
                    AI Reasoning
                  </h4>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    {analysis.reasoning}
                  </p>
                </div>

                {/* Vitals Column (2/5) */}
                <div className="md:col-span-2 border border-gray-200 rounded-xl p-5">
                  <h4 className="text-gray-400 font-bold text-sm tracking-wide uppercase mb-4">
                    Vitals Snapshot
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span className="font-semibold text-sm">
                          Heart Rate:
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {patient.vitalSigns?.heartRate || "--"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-sm">
                          Blood Pressure:
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {patient.vitalSigns?.bloodPressureSys}/
                        {patient.vitalSigns?.bloodPressureDia || "--"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-sm">
                          Temperature:
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {patient.vitalSigns?.temperature || "--"} °C
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Wind className="w-4 h-4 text-sky-500" />
                        <span className="font-semibold text-sm">
                          O2 Saturation:
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {patient.vitalSigns?.o2Saturation || "--"}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={onClose}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
