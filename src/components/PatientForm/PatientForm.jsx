"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Activity,
  Clipboard,
  Heart,
  Check as CheckIcon,
  HeartHandshake,
} from "lucide-react";

// Base Schema used for both
const baseSchema = {
  fullName: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .matches(
      /^[A-Za-z\s\-']+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .required("Full name is required"),
  dateOfBirth: Yup.date()
    .max(
      new Date(new Date().setDate(new Date().getDate() - 1)),
      "Date of birth must be at least 1 day before today",
    )
    .required("Date of birth is required"),
  gender: Yup.string().required("Gender is required"),
  symptoms: Yup.string()
    .min(10, "Please describe symptoms in detail")
    .required("Symptoms are required"),
  painLevel: Yup.number().min(0).max(10),
  allergies: Yup.string(),
  medications: Yup.string(),
  chronicConditions: Yup.string(),
  smokes: Yup.string().oneOf(["Yes", "No", ""], "Please select Yes or No"),
  consumesAlcohol: Yup.string().oneOf(
    ["Yes", "No", ""],
    "Please select Yes or No",
  ),
  takesOtherDrugs: Yup.string().oneOf(
    ["Yes", "No", ""],
    "Please select Yes or No",
  ),
  otherDrugsDetails: Yup.string().when("takesOtherDrugs", {
    is: "Yes",
    then: () => Yup.string().required("Please specify the other drugs"),
    otherwise: () => Yup.string(),
  }),
};

// Vital Signs Schema
const vitalSignsSchema = {
  heartRate: Yup.number().min(0).max(300),
  bloodPressureSys: Yup.number().min(0).max(300),
  bloodPressureDia: Yup.number().min(0).max(200),
  temperature: Yup.number().min(90).max(115), // Fahrenheit Check
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
  smokes: "",
  consumesAlcohol: "",
  takesOtherDrugs: "",
  otherDrugsDetails: "",
  // Vitals
  heartRate: "",
  bloodPressureSys: "",
  bloodPressureDia: "",
  temperature: "",
  o2Saturation: "",
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

  const formInitialValues = initialValues;

  const handleFormSubmit = (values, actions) => {
    onSubmit(values, actions);
  };

  return (
    <Formik
      initialValues={formInitialValues}
      validationSchema={validationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize // Important for Edit Mode async data
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
              <Label htmlFor="gender">Gender *</Label>
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
              <ErrorMessage
                name="gender"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
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
            <div className="mt-3 flex items-center gap-4 p-2 border-0 rounded-lg">
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                No Pain (0)
              </span>
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
                style={{
                  background: `linear-gradient(to right, #0d9488 ${
                    (values.painLevel / 10) * 100
                  }%, #e5e7eb ${(values.painLevel / 10) * 100}%)`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 border-none outline-none"
              />
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                Severe Pain (10)
              </span>
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
            <Card className="p-6 my-8 border-none shadow-sm ring-1 ring-gray-200 bg-teal-50/50">
              <div className="flex items-center gap-2.5 mb-5">
                <Heart className="w-5 h-5 text-teal-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Vital signs
                </h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="heartRate" className="flex justify-between">
                    Heart Rate (BPM)
                    <span className="text-[10px] text-red-500 font-bold ml-2">
                      {getVitalMessage("heartRate", values.heartRate)}
                    </span>
                  </Label>
                  <Field
                    as={Input}
                    id="heartRate"
                    name="heartRate"
                    type="number"
                    className={`mt-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all duration-300 border ${getVitalColor("heartRate", values.heartRate)}`}
                  />
                </div>
                <div>
                  <Label>Blood Pressure</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative w-full">
                      <Field
                        as={Input}
                        id="bloodPressureSys"
                        name="bloodPressureSys"
                        type="number"
                        placeholder="SYS"
                        className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all duration-300 border text-center ${getVitalColor("bloodPressureSys", values.bloodPressureSys)}`}
                      />
                      <span className="absolute right-2 top-0.5 text-[8px] font-bold text-gray-400 uppercase">
                        Sys
                      </span>
                    </div>
                    <span className="text-gray-300 font-light text-xl">/</span>
                    <div className="relative w-full">
                      <Field
                        as={Input}
                        id="bloodPressureDia"
                        name="bloodPressureDia"
                        type="number"
                        placeholder="DIA"
                        className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all duration-300 border text-center ${getVitalColor("bloodPressureDia", values.bloodPressureDia)}`}
                      />
                      <span className="absolute right-2 top-0.5 text-[8px] font-bold text-gray-400 uppercase">
                        Dia
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="temperature" className="flex justify-between">
                    Temperature (°F)
                    <span className="text-[10px] text-red-500 font-bold ml-2">
                      {getVitalMessage("temperature", values.temperature)}
                    </span>
                  </Label>
                  <Field
                    as={Input}
                    id="temperature"
                    name="temperature"
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    className={`mt-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all duration-300 border ${getVitalColor("temperature", values.temperature)}`}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="o2Saturation"
                    className="flex justify-between"
                  >
                    O2 Saturation (%)
                    <span className="text-[10px] text-red-500 font-bold ml-2">
                      {getVitalMessage("o2Saturation", values.o2Saturation)}
                    </span>
                  </Label>
                  <Field
                    as={Input}
                    id="o2Saturation"
                    name="o2Saturation"
                    type="number"
                    className={`mt-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all duration-300 border ${getVitalColor("o2Saturation", values.o2Saturation)}`}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Lifestyle Habits - Moved to Bottom */}
          <div className="flex items-center border-b pb-2 gap-2.5 my-8">
            <span className="bg-[#EFFDFA] p-2 rounded-full">
              <HeartHandshake className="w-5 h-5 text-teal-600" />
            </span>
            <h2 className="text-xl font-semibold text-gray-900">Habits</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Smoking */}
            <div
              className={`flex items-center gap-3`}
              onClick={() =>
                setFieldValue("smokes", values.smokes === "Yes" ? "No" : "Yes")
              }
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  values.smokes === "Yes"
                    ? "bg-teal-600 border-teal-600"
                    : "bg-white border-gray-300"
                }`}
              >
                {values.smokes === "Yes" && (
                  <CheckIcon className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <Label className="cursor-pointer font-medium text-gray-700">
                Do you smoke?
              </Label>
            </div>
            <div
              className={`flex items-center gap-3`}
              onClick={() =>
                setFieldValue(
                  "consumesAlcohol",
                  values.consumesAlcohol === "Yes" ? "No" : "Yes",
                )
              }
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  values.consumesAlcohol === "Yes"
                    ? "bg-teal-600 border-teal-600"
                    : "bg-white border-gray-300"
                }`}
              >
                {values.consumesAlcohol === "Yes" && (
                  <CheckIcon className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <Label className="cursor-pointer font-medium text-gray-700">
                Do you consume alcohol?
              </Label>
            </div>

            {/* Other Drugs */}
            <div
              className={`flex items-center gap-3`}
              onClick={() =>
                setFieldValue(
                  "takesOtherDrugs",
                  values.takesOtherDrugs === "Yes" ? "No" : "Yes",
                )
              }
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  values.takesOtherDrugs === "Yes"
                    ? "bg-teal-600 border-teal-600"
                    : "bg-white border-gray-300"
                }`}
              >
                {values.takesOtherDrugs === "Yes" && (
                  <CheckIcon className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <Label className="cursor-pointer font-medium text-gray-700">
                Do you take any other drugs?
              </Label>
            </div>
          </div>

          {/* Conditional Textbox for Other Drugs */}
          {values.takesOtherDrugs === "Yes" && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label htmlFor="otherDrugsDetails">
                Please specify the other drugs *
              </Label>
              <Field
                as="textarea"
                id="otherDrugsDetails"
                name="otherDrugsDetails"
                placeholder="Enter details about other drugs..."
                rows={3}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <ErrorMessage
                name="otherDrugsDetails"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-8 py-2 rounded-full cursor-pointer border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 cursor-pointer text-white px-8 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? "Submitting..." : submitLabel}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
