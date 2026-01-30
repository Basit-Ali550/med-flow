"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Card,
  Badge,
} from "@/components";
import {
  History,
  ClipboardList,
  Pill,
  AlertCircle,
  User,
  Calendar,
  Fingerprint,
} from "lucide-react";
import { calculateAge } from "@/lib/utils";

export function PatientHistoryModal({ isOpen, onClose, patient }) {
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 border-none shadow-2xl rounded-xl overflow-hidden">
        {/* Header - Aligned with the app's teal theme */}
        <DialogHeader className="bg-teal-600 p-8 text-white relative">
          <div className="flex gap-4 items-center relative z-10">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
              <User size={28} className="text-white fill-white/10" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {patient.fullName}
              </DialogTitle>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 py-0.5 px-2.5 rounded-full font-bold uppercase text-[10px] tracking-widest">
                  {calculateAge(patient.dateOfBirth)} Years
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 py-0.5 px-2.5 rounded-full font-bold uppercase text-[10px] tracking-widest">
                  {patient.gender}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto bg-gray-50/50">
          {/* Chief Complaint / Symptoms */}
          <Card className="p-5 border-none shadow-sm ring-1 ring-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-3 text-teal-600 font-bold text-xs uppercase tracking-widest">
              <ClipboardList size={14} />
              Current Condition
            </div>
            <p className="text-gray-900 leading-relaxed font-medium italic">
              &ldquo;
              {patient.chiefComplaint ||
                patient.symptoms ||
                "No current clinical notes."}
              &rdquo;
            </p>
          </Card>

          <div className="space-y-4">
            {/* Medical History Section */}
            <HistorySection
              icon={<History className="text-blue-500" />}
              title="Medical History"
              subtitle="Chronic conditions & prior illnesses"
              content={patient.medicalHistory || patient.chronicConditions}
              emptyMessage="No recorded medical history on file."
            />

            <HistorySection
              icon={<Pill className="text-purple-500" />}
              title="Medications"
              subtitle="Current regular medications"
              content={patient.medications}
              emptyMessage="No recorded medications."
            />

            <HistorySection
              icon={<AlertCircle className="text-rose-500" />}
              title="Allergies"
              subtitle="Drug, Food or Environmental"
              content={patient.allergies}
              emptyMessage="No known clinical allergies."
              isRed={!!patient.allergies}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 cursor-pointer rounded-full shadow-lg font-bold transition-all "
          >
            Close Summary
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const HistorySection = ({
  icon,
  title,
  subtitle,
  content,
  emptyMessage,
  isRed,
}) => (
  <Card
    className={`p-5 border-none shadow-sm ring-1 ${isRed ? "ring-rose-200 bg-rose-50/30" : "ring-gray-200 bg-white"}`}
  >
    <div className="flex items-start gap-4">
      <div className={`p-2 rounded-lg ${isRed ? "bg-rose-100" : "bg-gray-50"}`}>
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <div>
        <h4
          className={`font-bold text-sm ${isRed ? "text-rose-700" : "text-gray-900"}`}
        >
          {title}
        </h4>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 mt-0.5">
          {subtitle}
        </p>
        <p
          className={`text-sm ${content ? "text-gray-700 font-medium" : "text-gray-400 italic"}`}
        >
          {content || emptyMessage}
        </p>
      </div>
    </div>
  </Card>
);
