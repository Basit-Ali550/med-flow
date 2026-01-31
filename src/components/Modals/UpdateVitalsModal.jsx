"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Card,
} from "@/components";
import {
  Activity,
  Loader2,
  Heart,
  Thermometer,
  Droplet,
  Wind,
} from "lucide-react";
import { patientsApi } from "@/lib/api";
import { toast } from "sonner";
import { handleClientError } from "@/lib/error-handler";
import { calculateAge } from "@/lib/utils";

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

  useEffect(() => {
    if (patient?.vitalSigns) {
      setVitals({
        heartRate: patient.vitalSigns.heartRate || "",
        bloodPressureSys: patient.vitalSigns.bloodPressureSys || "",
        bloodPressureDia: patient.vitalSigns.bloodPressureDia || "",
        temperature: patient.vitalSigns.temperature || "",
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
  }, [patient, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVitals((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient?._id) return;

    setIsSubmitting(true);
    try {
      const payload = Object.entries(vitals).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      if (Object.keys(payload).length === 0) {
        toast.warning("Please enter at least one vital sign");
        setIsSubmitting(false);
        return;
      }

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

  // Helper for Validation Colors
  const getVitalColor = (type, value) => {
    if (!value) return "border-gray-200 focus:border-teal-500";
    const num = parseFloat(value);

    switch (type) {
      case "heartRate":
        if (num < 40 || num > 150)
          return "border-red-500 focus:border-red-600 bg-red-50";
        if (num < 60 || num > 100)
          return "border-amber-500 focus:border-amber-600 bg-amber-50";
        return "border-emerald-500 focus:border-emerald-600 bg-emerald-50";

      case "temperature":
        // Fahrenheit Ranges
        if (num < 95.0 || num > 103.1)
          return "border-red-500 focus:border-red-600 bg-red-50";
        if (num < 96.8 || num > 99.5)
          return "border-amber-500 focus:border-amber-600 bg-amber-50";
        return "border-emerald-500 focus:border-emerald-600 bg-emerald-50";

      case "bloodPressureSys":
        if (num < 90 || num > 180)
          return "border-red-500 focus:border-red-600 bg-red-50";
        if (num > 120)
          return "border-amber-500 focus:border-amber-600 bg-amber-50";
        return "border-emerald-500 focus:border-emerald-600 bg-emerald-50";

      case "bloodPressureDia":
        if (num < 60 || num > 110)
          return "border-red-500 focus:border-red-600 bg-red-50";
        if (num > 80)
          return "border-amber-500 focus:border-amber-600 bg-amber-50";
        return "border-emerald-500 focus:border-emerald-600 bg-emerald-50";

      case "o2Saturation":
        if (num < 85) return "border-red-500 focus:border-red-600 bg-red-50";
        if (num < 95)
          return "border-amber-500 focus:border-amber-600 bg-amber-50";
        return "border-emerald-500 focus:border-emerald-600 bg-emerald-50";

      default:
        return "border-gray-200 focus:border-teal-500";
    }
  };

  const getVitalMessage = (type, value) => {
    if (!value) return null;
    const num = parseFloat(value);

    switch (type) {
      case "heartRate":
        if (num > 150) return "Critical High";
        if (num < 40) return "Critical Low";
        if (num > 100) return "Tachycardia";
        if (num < 60) return "Bradycardia";
        break;
      case "temperature":
        // Fahrenheit Messages
        if (num > 102.2) return "High Fever";
        if (num > 99.5) return "Fever";
        if (num < 95) return "Hypothermia";
        break;
      case "o2Saturation":
        if (num < 90) return "Critical Hypoxia";
        if (num < 95) return "Low O2";
        break;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 border-none shadow-2xl rounded-xl overflow-hidden">
        <DialogHeader className="bg-teal-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-teal-100" />
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Update Vitals
              </DialogTitle>
              <p className="text-teal-100 text-xs font-medium uppercase tracking-wider mt-1">
                {patient?.fullName} • {calculateAge(patient?.dateOfBirth)} Years
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 bg-gray-50/50">
          <div className="space-y-4">
            {/* Primary Vitals Card */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="heartRate"
                  className="text-xs font-bold text-gray-500 uppercase flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" /> Heart Rate
                  </div>
                  <span className="text-[10px] text-red-500 font-bold">
                    {getVitalMessage("heartRate", vitals.heartRate)}
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="heartRate"
                    name="heartRate"
                    type="number"
                    placeholder="00"
                    value={vitals.heartRate}
                    onChange={handleChange}
                    className={`h-11 transition-all duration-300 border-2 ${getVitalColor("heartRate", vitals.heartRate)}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                    BPM
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="temperature"
                  className="text-xs font-bold text-gray-500 uppercase flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Temp
                  </div>
                  <span className="text-[10px] text-red-500 font-bold">
                    {getVitalMessage("temperature", vitals.temperature)}
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="temperature"
                    name="temperature"
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={vitals.temperature}
                    onChange={handleChange}
                    className={`h-11 transition-all duration-300 border-2 ${getVitalColor("temperature", vitals.temperature)}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                    °F
                  </span>
                </div>
              </div>
            </div>

            {/* Blood Pressure Card */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5 mb-3">
                <Droplet className="w-3.5 h-3.5 text-teal-600" />
                Blood Pressure
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative w-full">
                  <Input
                    id="bloodPressureSys"
                    name="bloodPressureSys"
                    type="number"
                    placeholder="SYS"
                    value={vitals.bloodPressureSys}
                    onChange={handleChange}
                    className={`h-11 transition-all duration-300 border-2 text-center font-bold ${getVitalColor("bloodPressureSys", vitals.bloodPressureSys)}`}
                  />
                  <span className="absolute right-2 top-1 text-[8px] font-bold text-gray-400 uppercase">
                    Sys
                  </span>
                </div>
                <span className="text-gray-300 font-light text-xl">/</span>
                <div className="relative w-full">
                  <Input
                    id="bloodPressureDia"
                    name="bloodPressureDia"
                    type="number"
                    placeholder="DIA"
                    value={vitals.bloodPressureDia}
                    onChange={handleChange}
                    className={`h-11 transition-all duration-300 border-2 text-center font-bold ${getVitalColor("bloodPressureDia", vitals.bloodPressureDia)}`}
                  />
                  <span className="absolute right-2 top-1 text-[8px] font-bold text-gray-400 uppercase">
                    Dia
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="o2Saturation"
                className="text-xs font-bold text-gray-500 uppercase flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-blue-500" /> O2 Saturation
                </div>
                <span className="text-[10px] text-red-500 font-bold">
                  {getVitalMessage("o2Saturation", vitals.o2Saturation)}
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="o2Saturation"
                  name="o2Saturation"
                  type="number"
                  placeholder="98"
                  value={vitals.o2Saturation}
                  onChange={handleChange}
                  className={`h-11 transition-all duration-300 border-2 ${getVitalColor("o2Saturation", vitals.o2Saturation)}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  %
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 flex items-center gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-8 rounded-full border-gray-300 cursor-pointer font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 cursor-pointer rounded-full shadow-lg font-bold transition-all "
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Update Vitals"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
