"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PatientForm from "@/components/PatientForm/PatientForm";
import { patientsApi } from "@/lib/api";
import { handleClientError } from "@/lib/error-handler";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function EditPatientModal({ isOpen, onClose, patient, onUpdateSuccess }) {
    const [initialValues, setInitialValues] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && patient) {
            // Transform patient data to form values
            setInitialValues({
                fullName: patient.fullName || "",
                dateOfBirth: patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
                    : "",
                gender: patient.gender || "",
                symptoms: patient.symptoms || "",
                painLevel: patient.painLevel || 0,
                allergies: patient.allergies || "",
                medications: patient.medications || "",
                chronicConditions: patient.chronicConditions || "",
                medicalHistory: patient.medicalHistory || "",
                chiefComplaint: patient.chiefComplaint || "",
                // Vitals mapping
                heartRate: patient.vitalSigns?.heartRate || "",
                bloodPressureSys: patient.vitalSigns?.bloodPressureSys || "",
                bloodPressureDia: patient.vitalSigns?.bloodPressureDia || "",
                temperature: patient.vitalSigns?.temperature || "",
                o2Saturation: patient.vitalSigns?.o2Saturation || "",
            });
        } else {
            setInitialValues(null);
        }
    }, [isOpen, patient]);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setIsLoading(true);
            const { data } = await patientsApi.update(patient._id, values);
            toast.success("Patient updated successfully!");

            if (onUpdateSuccess) {
                onUpdateSuccess(data.patient);
            }
            onClose();
        } catch (error) {
            handleClientError(error);
        } finally {
            setIsLoading(false);
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Patient</DialogTitle>
                </DialogHeader>

                {initialValues ? (
                    <PatientForm
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        showVitalSigns={true}
                        submitLabel={isLoading ? "Updating..." : "Save Changes"}
                        isModal={true} // Hint for styling if needed
                    />
                ) : (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-teal-600" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
