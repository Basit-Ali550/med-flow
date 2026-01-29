"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Activity, Clipboard, Heart } from "lucide-react";

// Validation Schema
const validationSchema = Yup.object({
  fullName: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  dateOfBirth: Yup.date()
    .max(new Date(), "Date of birth cannot be in the future")
    .required("Date of birth is required"),
  gender: Yup.string(),
  symptoms: Yup.string()
    .min(10, "Please describe symptoms in detail")
    .required("Symptoms are required"),
  painLevel: Yup.number().min(0).max(10),
  allergies: Yup.string(),
  medications: Yup.string(),
  chronicConditions: Yup.string(),
  heartRate: Yup.number().min(0).max(300),
  bloodPressureSys: Yup.number().min(0).max(300),
  bloodPressureDia: Yup.number().min(0).max(200),
  temperature: Yup.number().min(30).max(45),
  o2Saturation: Yup.number().min(0).max(100),
});

// Initial Values
const initialValues = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  symptoms: "",
  painLevel: 0,
  allergies: "",
  medications: "",
  chronicConditions: "",
  heartRate: "",
  bloodPressureSys: "",
  bloodPressureDia: "",
  temperature: "",
  o2Saturation: "",
};

export default function AddPatient() {
  const router = useRouter();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // TODO: API call to add patient
      console.log("Patient data:", values);
      toast.success("Patient added successfully!");
      
      setTimeout(() => {
        router.push("/nurse/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("Failed to add patient. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/nurse/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="bg-teal-600 text-white py-4 px-6 flex items-center justify-between">
        <div className="bg-white rounded-full py-2 px-3 flex items-center gap-0.5">
          <span className="text-teal-600 font-bold text-xs">Med</span>
          <span className="text-teal-500 font-bold text-xs">Flow</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Add Patient</h1>
          <p className="text-sm text-teal-100 mt-1">
            Please fill in all relevant medical information.
          </p>
        </div>
        <div className="w-20"></div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto py-8 px-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting, setFieldValue }) => (
            <Form>
              {/* Personal Information */}
              <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <User className="w-5 h-5 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personal information
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Field
                      as={Input}
                      id="fullName"
                      name="fullName"
                      placeholder="Enter the full name..."
                      className="mt-2"
                    />
                    <ErrorMessage
                      name="fullName"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Field
                      as={Input}
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      className="mt-2"
                    />
                    <ErrorMessage
                      name="dateOfBirth"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Field
                      as="select"
                      id="gender"
                      name="gender"
                      className="mt-2 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="">No Selection</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Field>
                  </div>
                </div>
              </div>

              {/* Current Condition */}
              <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <Activity className="w-5 h-5 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Current Condition
                  </h2>
                </div>
                <div className="mb-5">
                  <Label htmlFor="symptoms">Main symptoms *</Label>
                  <Field
                    as="textarea"
                    id="symptoms"
                    name="symptoms"
                    placeholder="Describe what the patient is feeling..."
                    rows={4}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  />
                  <ErrorMessage
                    name="symptoms"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="mb-5">
                  <Label htmlFor="painLevel">Pain level</Label>
                  <div className="mt-3">
                    <input
                      type="range"
                      id="painLevel"
                      name="painLevel"
                      min="0"
                      max="10"
                      value={values.painLevel}
                      onChange={(e) => setFieldValue("painLevel", e.target.value)}
                      className="w-full accent-teal-600 h-2"
                    />
                    <div className="flex justify-between text-sm text-gray-700 mt-1">
                      <span>0</span>
                      <span>10</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>very low</span>
                      <span>very high</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <Clipboard className="w-5 h-5 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Medical history
                  </h2>
                </div>
                <div className="mb-5">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Field
                    as={Input}
                    id="allergies"
                    name="allergies"
                    placeholder="e.g. Penicillin (Leave blank if none)"
                    className="mt-2"
                  />
                </div>
                <div className="mb-5">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Field
                    as={Input}
                    id="medications"
                    name="medications"
                    placeholder="List any medications you are taking..."
                    className="mt-2"
                  />
                </div>
                <div className="mb-5">
                  <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                  <Field
                    as={Input}
                    id="chronicConditions"
                    name="chronicConditions"
                    placeholder="e.g. Diabetes, Hypertension"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Vital Signs */}
              <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <Heart className="w-5 h-5 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Vital signs
                  </h2>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
                      <Field
                        as={Input}
                        id="heartRate"
                        name="heartRate"
                        type="number"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Blood Pressure (SYS/DIA)</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Field
                          as={Input}
                          id="bloodPressureSys"
                          name="bloodPressureSys"
                          type="number"
                          className="w-16"
                        />
                        <span className="text-xl text-gray-500">/</span>
                        <Field
                          as={Input}
                          id="bloodPressureDia"
                          name="bloodPressureDia"
                          type="number"
                          className="w-16"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Field
                        as={Input}
                        id="temperature"
                        name="temperature"
                        type="number"
                        step="0.1"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="o2Saturation">O2 Saturation (%)</Label>
                      <Field
                        as={Input}
                        id="o2Saturation"
                        name="o2Saturation"
                        type="number"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-4 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="px-8 py-2 rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 px-8 py-2 rounded-full"
                >
                  {isSubmitting ? "Adding..." : "Confirm"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </main>
    </div>
  );
}
