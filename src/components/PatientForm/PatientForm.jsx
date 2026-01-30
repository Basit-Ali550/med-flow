"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Activity, Clipboard, Heart } from "lucide-react";

// Base Schema used for both
const baseSchema = {
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
};

// Vital Signs Schema
const vitalSignsSchema = {
  heartRate: Yup.number().min(0).max(300),
  bloodPressureSys: Yup.number().min(0).max(300),
  bloodPressureDia: Yup.number().min(0).max(200),
  temperature: Yup.number().min(30).max(45),
  o2Saturation: Yup.number().min(0).max(100),
};

const defaultInitialValues = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  symptoms: "",
  painLevel: 0,
  allergies: "",
  medications: "",
  chronicConditions: "",
  // Vitals
  heartRate: "",
  bloodPressureSys: "",
  bloodPressureDia: "",
  temperature: "",
  o2Saturation: "",
};

export default function PatientForm({
  initialValues = defaultInitialValues,
  onSubmit,
  onCancel,
  showVitalSigns = false,
  submitLabel = "Submit",
}) {
  const validationSchema = Yup.object({
    ...baseSchema,
    ...(showVitalSigns ? vitalSignsSchema : {}),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, isSubmitting, setFieldValue }) => (
        <Form>
          {/* Personal Information */}

          <div className="flex items-center border-b pb-2 gap-2.5 mb-5">
            <span className="bg-[#EFFDFA] p-2 rounded-full">
              <User className="w-5 h-5 text-teal-600" />
            </span>
            <h2 className="text-xl font-semibold text-gray-900">
              Personal information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Field
                as={Input}
                id="fullName"
                name="fullName"
                placeholder="Enter full name"
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
                className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">No Selection</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Field>
            </div>
          </div>

          {/* Current Condition */}
          <div className="flex items-center border-b pb-2 gap-2.5 mb-6">
            <span className="bg-[#EFFDFA] p-2 rounded-full">
              <Activity className="w-5 h-5 text-teal-600" />
            </span>
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
              placeholder="Describe symptoms in detail..."
              rows={4}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <ErrorMessage
              name="symptoms"
              component="p"
              className="text-red-500 text-sm mt-1"
            />
          </div>
          <div className="mb-5">
            <Label htmlFor="painLevel">
              Pain level ({values.painLevel}/10)
            </Label>
            <div className="mt-3">
              <input
                type="range"
                id="painLevel"
                name="painLevel"
                min="0"
                max="10"
                value={values.painLevel}
                onChange={(e) =>
                  setFieldValue("painLevel", parseInt(e.target.value))
                }
                className="w-full accent-teal-600 h-2 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                <span>No Pain (0)</span>
                <span>Severe Pain (10)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center border-b pb-2 gap-2.5 my-5">
            <span className="bg-[#EFFDFA] p-2 rounded-full">
              <Clipboard className="w-5 h-5 text-teal-600" />
            </span>
            <h2 className="text-xl font-semibold text-gray-900">
              Medical history
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Field
                as={Input}
                id="allergies"
                name="allergies"
                placeholder="e.g. Penicillin"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="medications">Current Medications</Label>
              <Field
                as={Input}
                id="medications"
                name="medications"
                placeholder="List current medications..."
                className="mt-2"
              />
            </div>
            <div>
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

          {/* Vital Signs - Only shown if requested */}
          {showVitalSigns && (
            <Card className="p-6 mb-8 border-none shadow-sm ring-1 ring-gray-200 bg-teal-50/50">
              <div className="flex items-center gap-2.5 mb-5">
                <Heart className="w-5 h-5 text-teal-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Vital signs
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
                  <Field
                    as={Input}
                    id="heartRate"
                    name="heartRate"
                    type="number"
                    className="mt-2 bg-white"
                  />
                </div>
                <div>
                  <Label>Blood Pressure</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Field
                      as={Input}
                      id="bloodPressureSys"
                      name="bloodPressureSys"
                      type="number"
                      placeholder="SYS"
                      className="bg-white"
                    />
                    <span className="text-gray-400">/</span>
                    <Field
                      as={Input}
                      id="bloodPressureDia"
                      name="bloodPressureDia"
                      type="number"
                      placeholder="DIA"
                      className="bg-white"
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
                    className="mt-2 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="o2Saturation">O2 Saturation (%)</Label>
                  <Field
                    as={Input}
                    id="o2Saturation"
                    name="o2Saturation"
                    type="number"
                    className="mt-2 bg-white"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-8 py-2 rounded-full border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? "Submitting..." : submitLabel}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
