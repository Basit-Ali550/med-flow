"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Input,
  Label,
} from "@/components";
import {
  Activity,
  Loader2,
  Heart,
  Thermometer,
  Wind,
  AlertTriangle,
  X,
  Save,
  CheckCircle,
} from "lucide-react";
import { patientsApi } from "@/lib/api";
import { toast } from "sonner";
import { handleClientError } from "@/lib/error-handler";
import { cn } from "@/lib/utils";

// Helper functions for Temperature Conversion
const cToF = (celsius) => {
  if (!celsius && celsius !== 0) return "";
  return ((celsius * 9) / 5 + 32).toFixed(1);
};

const fToC = (fahrenheit) => {
  if (!fahrenheit && fahrenheit !== 0) return null;
  return ((fahrenheit - 32) * 5) / 9;
};

const VITALS_CONFIG = {
  bloodPressure: {
    sys: { min: 90, max: 140 },
    dia: { min: 60, max: 90 },
  },
  heartRate: { min: 60, max: 100 },
  temperature: { min: 97.0, max: 99.5 }, // F ranges
  o2Saturation: { min: 95, max: 100 },
};

export function UpdateVitalsModal({
  isOpen,
  onClose,
  patient,
  onUpdateSuccess,
}) {
  const [vitals, setVitals] = useState({
    heartRate: "",
    bloodPressureSys: "",
    bloodPressureDia: "",
    temperature: "",
    o2Saturation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status state: { [field]: 'normal' | 'abnormal' | null }
  const [status, setStatus] = useState({});
  const [showAbnormalAlert, setShowAbnormalAlert] = useState(false);

  useEffect(() => {
    if (patient?.vitalSigns) {
      // Backend stores Temp in Celsius, convert to F for display
      const tempF = patient.vitalSigns.temperature ? cToF(patient.vitalSigns.temperature) : "";

      setVitals({
        heartRate: patient.vitalSigns.heartRate || "",
        bloodPressureSys: patient.vitalSigns.bloodPressureSys || "",
        bloodPressureDia: patient.vitalSigns.bloodPressureDia || "",
        temperature: tempF,
        o2Saturation: patient.vitalSigns.o2Saturation || "",
      });
    } else {
      setVitals({
        heartRate: "",
        bloodPressureSys: "",
        bloodPressureDia: "",
        temperature: "",
        o2Saturation: "",
      });
    }
    setStatus({});
    setShowAbnormalAlert(false);
  }, [patient, isOpen]);

  const validateVitals = (currentVitals) => {
    const newStatus = {};
    let hasAbnormal = false;

    // Check BP
    const sys = Number(currentVitals.bloodPressureSys);
    const dia = Number(currentVitals.bloodPressureDia);

    if (currentVitals.bloodPressureSys && currentVitals.bloodPressureDia) {
      if ((sys < VITALS_CONFIG.bloodPressure.sys.min || sys > VITALS_CONFIG.bloodPressure.sys.max) ||
        (dia < VITALS_CONFIG.bloodPressure.dia.min || dia > VITALS_CONFIG.bloodPressure.dia.max)) {
        newStatus.bloodPressure = 'abnormal';
        hasAbnormal = true;
      } else {
        newStatus.bloodPressure = 'normal';
      }
    }

    // Check HR
    const hr = Number(currentVitals.heartRate);
    if (currentVitals.heartRate) {
      if (hr < VITALS_CONFIG.heartRate.min || hr > VITALS_CONFIG.heartRate.max) {
        newStatus.heartRate = 'abnormal';
        hasAbnormal = true;
      } else {
        newStatus.heartRate = 'normal';
      }
    }

    // Check Temp
    // Use F logic for UI, since input is F
    const temp = Number(currentVitals.temperature);
    if (currentVitals.temperature) {
      if (temp < VITALS_CONFIG.temperature.min || temp > VITALS_CONFIG.temperature.max) {
        newStatus.temperature = 'abnormal';
        hasAbnormal = true;
      } else {
        newStatus.temperature = 'normal';
      }
    }

    // Check O2
    const o2 = Number(currentVitals.o2Saturation);
    if (currentVitals.o2Saturation) {
      if (o2 < VITALS_CONFIG.o2Saturation.min) {
        newStatus.o2Saturation = 'abnormal';
        hasAbnormal = true;
      } else {
        newStatus.o2Saturation = 'normal';
      }
    }

    setStatus(newStatus);
    setShowAbnormalAlert(hasAbnormal);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Simple number check could be added here
    const newVitals = { ...vitals, [name]: value };
    setVitals(newVitals);
    validateVitals(newVitals);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient?._id) return;

    setIsSubmitting(true);
    try {
      // payload preparation: F -> C
      // We must nest vitals under 'vitalSigns' so PATCH/PUT works cleanly
      const payload = {
        vitalSigns: {
          ...vitals,
          temperature: vitals.temperature ? fToC(Number(vitals.temperature)) : null
        }
      };

      const data = await patientsApi.update(patient._id, payload);
      toast.success("Vital signs updated successfully");

      onUpdateSuccess?.(data.data.patient);

      onClose();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContainerClass = (statKey) => {
    const stat = status[statKey];
    if (stat === 'abnormal') return "border-red-100 bg-red-50/30";
    if (stat === 'normal') return "border-green-100 bg-green-50/30";
    return "border-gray-100 bg-white";
  };

  const getInputClass = (statKey) => {
    const stat = status[statKey];
    if (stat === 'abnormal') return "focus:ring-red-200 focus:border-red-300";
    if (stat === 'normal') return "focus:ring-green-200 focus:border-green-300";
    return "focus:ring-indigo-200 focus:border-indigo-300";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 border-none shadow-2xl rounded-2xl overflow-hidden overflow-y-auto max-h-[calc(100vh-4rem)] bg-white">

        {/* Header */}
        <div className="p-6 pb-2 relative">
          <div className="flex justify-start items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Record Vital Signs
              </DialogTitle>
              <p className="text-gray-500 text-sm font-medium">
                Patient: <span className="text-gray-900 font-bold">{patient?.fullName}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-2">

          {/* BP Card */}
          <div className={cn("p-4 rounded-xl border-2 transition-colors", getContainerClass('bloodPressure'))}>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <div className={cn("p-1.5 rounded-md", status.bloodPressure === 'abnormal' ? "bg-red-100 text-red-500" : status.bloodPressure === 'normal' ? "bg-green-100 text-green-600" : "bg-teal-100 text-teal-600")}>
                  <Heart className="w-4 h-4" />
                </div>
                Blood Pressure
              </Label>
              {status.bloodPressure === 'abnormal' && (
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Abnormal
                </span>
              )}
              {status.bloodPressure === 'normal' && (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Normal
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  name="bloodPressureSys"
                  type="number"
                  placeholder="120"
                  value={vitals.bloodPressureSys}
                  onChange={handleChange}
                  className={cn("h-12 text-center text-lg font-bold border-gray-200 bg-white", getInputClass('bloodPressure'))}
                />
              </div>
              <span className="text-gray-300 text-2xl font-light">/</span>
              <div className="relative flex-1">
                <Input
                  name="bloodPressureDia"
                  type="number"
                  placeholder="80"
                  value={vitals.bloodPressureDia}
                  onChange={handleChange}
                  className={cn("h-12 text-center text-lg font-bold border-gray-200 bg-white", getInputClass('bloodPressure'))}
                />
              </div>
              <span className="text-xs font-bold text-gray-400 w-8">mmHg</span>
            </div>
            <div className="mt-2 text-[10px] text-gray-400 text-center font-medium">
              Normal: 90-140 / 60-90 mmHg
            </div>
          </div>

          {/* HR Card */}
          <div className={cn("p-4 rounded-xl border-2 transition-colors", getContainerClass('heartRate'))}>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <div className={cn("p-1.5 rounded-md", status.heartRate === 'abnormal' ? "bg-red-100 text-red-500" : status.heartRate === 'normal' ? "bg-green-100 text-green-600" : "bg-teal-100 text-teal-600")}>
                  <Activity className="w-4 h-4" />
                </div>
                Heart Rate
              </Label>
              {status.heartRate === 'abnormal' && (
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Abnormal
                </span>
              )}
              {status.heartRate === 'normal' && (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Normal
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  name="heartRate"
                  type="number"
                  placeholder="80"
                  value={vitals.heartRate}
                  onChange={handleChange}
                  className={cn("h-12 text-center text-lg font-bold border-gray-200 bg-white", getInputClass('heartRate'))}
                />
              </div>
              <span className="text-xs font-bold text-gray-400 w-8">BPM</span>
            </div>
            <div className="mt-2 text-[10px] text-gray-400 text-center font-medium">
              Normal: 60-100 BPM
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Temp Card */}
            <div className={cn("p-4 rounded-xl border-2 transition-colors", getContainerClass('temperature'))}>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-md", status.temperature === 'abnormal' ? "bg-red-100 text-red-500" : status.temperature === 'normal' ? "bg-green-100 text-green-600" : "bg-teal-100 text-teal-600")}>
                    <Thermometer className="w-4 h-4" />
                  </div>
                  Temp
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    name="temperature"
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={vitals.temperature}
                    onChange={handleChange}
                    className={cn("h-12 text-center text-lg font-bold border-gray-200 bg-white", getInputClass('temperature'))}
                  />
                </div>
                <span className="text-xs font-bold text-gray-400 w-4">°F</span>
              </div>
              {status.temperature === 'abnormal' && (
                <div className="mt-2 text-center">
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> High/Low
                  </span>
                </div>
              )}
            </div>

            {/* O2 Card */}
            <div className={cn("p-4 rounded-xl border-2 transition-colors", getContainerClass('o2Saturation'))}>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-md", status.o2Saturation === 'abnormal' ? "bg-red-100 text-red-500" : status.o2Saturation === 'normal' ? "bg-green-100 text-green-600" : "bg-teal-100 text-teal-600")}>
                    <Wind className="w-4 h-4" />
                  </div>
                  SpO₂
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    name="o2Saturation"
                    type="number"
                    placeholder="98"
                    value={vitals.o2Saturation}
                    onChange={handleChange}
                    className={cn("h-12 text-center text-lg font-bold border-gray-200 bg-white", getInputClass('o2Saturation'))}
                  />
                </div>
                <span className="text-xs font-bold text-gray-400 w-4">%</span>
              </div>
              {status.o2Saturation === 'abnormal' && (
                <div className="mt-2 text-center">
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Low
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Global Alert for Abnormal Values */}
          {showAbnormalAlert && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3 mt-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-red-100 p-1.5 rounded-lg shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-900 leading-tight mb-0.5">Abnormal Values Detected</h4>
                <p className="text-xs text-red-700 leading-snug">
                  Please verify measurements. These will be flagged in the triage prioritization.
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-200 rounded-xl h-11 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl h-11 px-6 font-bold shadow-lg shadow-indigo-200 flex items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Vitals
                </>
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
