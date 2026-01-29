"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Activity, Clipboard } from "lucide-react";

export default function PatientRegistration() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    symptoms: "",
    painLevel: 5,
    allergies: "",
    medications: "",
    chronicConditions: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: API call to submit registration
      console.log("Patient data:", formData);
      toast.success("Registration submitted successfully!");
      
      // Redirect after successful registration
      setTimeout(() => {
        router.push("/patient/success");
      }, 1500);
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "var(--color-bg-primary)",
    },
    header: {
      backgroundColor: "var(--color-primary)",
      color: "var(--color-text-white)",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
    },
    logo: {
      backgroundColor: "var(--color-bg-white)",
      borderRadius: "9999px",
      padding: "8px 12px",
      display: "flex",
      alignItems: "center",
      gap: "2px",
    },
    logoMed: {
      color: "var(--color-primary)",
      fontWeight: "700",
      fontSize: "14px",
    },
    logoFlow: {
      color: "var(--color-primary-light)",
      fontWeight: "700",
      fontSize: "14px",
    },
    headerCenter: {
      textAlign: "center",
    },
    headerTitle: {
      fontSize: "24px",
      fontWeight: "600",
    },
    headerSubtitle: {
      fontSize: "14px",
      color: "var(--color-primary-100)",
      marginTop: "4px",
    },
    main: {
      maxWidth: "600px",
      margin: "0 auto",
      padding: "32px 16px",
    },
    section: {
      marginBottom: "32px",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "20px",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "var(--color-text-primary)",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "16px",
    },
    formGridTwo: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },
    formGroup: {
      marginBottom: "16px",
    },
    sliderContainer: {
      marginTop: "8px",
    },
    sliderLabels: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "12px",
      color: "var(--color-text-secondary)",
      marginTop: "4px",
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "32px",
      paddingTop: "24px",
      borderTop: "1px solid var(--color-border)",
    },
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <span style={styles.logoMed}>Med</span>
            <span style={styles.logoFlow}>Flow</span>
          </div>
        </div>
        <div style={styles.headerCenter}>
          <h1 style={styles.headerTitle}>Patient registration</h1>
          <p style={styles.headerSubtitle}>Please fill in all relevant medical information.</p>
        </div>
        <div style={{ width: "80px" }}></div>
      </header>

      {/* Form */}
      <main style={styles.main}>
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Card className="p-6 mb-6">
            <div style={styles.sectionHeader}>
              <User className="w-5 h-5 text-teal-600" />
              <h2 style={styles.sectionTitle}>Personal information</h2>
            </div>
            <div style={styles.formGrid}>
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name..."
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  placeholder="Enter Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">No Selection</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Current Condition */}
          <Card className="p-6 mb-6">
            <div style={styles.sectionHeader}>
              <Activity className="w-5 h-5 text-teal-600" />
              <h2 style={styles.sectionTitle}>Current Condition</h2>
            </div>
            <div style={styles.formGroup}>
              <Label htmlFor="symptoms">Main symptoms *</Label>
              <textarea
                id="symptoms"
                name="symptoms"
                placeholder="Describe what you are feeling..."
                value={formData.symptoms}
                onChange={handleChange}
                required
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </div>
            <div style={styles.formGroup}>
              <Label htmlFor="painLevel">Pain level</Label>
              <div style={styles.sliderContainer}>
                <input
                  type="range"
                  id="painLevel"
                  name="painLevel"
                  min="0"
                  max="10"
                  value={formData.painLevel}
                  onChange={handleChange}
                  className="w-full accent-teal-600"
                />
                <div style={styles.sliderLabels}>
                  <span>0 - very low</span>
                  <span>10 - very high</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Medical History */}
          <Card className="p-6 mb-6">
            <div style={styles.sectionHeader}>
              <Clipboard className="w-5 h-5 text-teal-600" />
              <h2 style={styles.sectionTitle}>Medical history</h2>
            </div>
            <div style={styles.formGroup}>
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                name="allergies"
                placeholder="e.g. Penicillin (Leave blank if none)"
                value={formData.allergies}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div style={styles.formGroup}>
              <Label htmlFor="medications">Current Medications</Label>
              <Input
                id="medications"
                name="medications"
                placeholder="List any medications you are taking..."
                value={formData.medications}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div style={styles.formGroup}>
              <Label htmlFor="chronicConditions">Chronic Conditions</Label>
              <Input
                id="chronicConditions"
                name="chronicConditions"
                placeholder="e.g. Diabetes, Hypertension"
                value={formData.chronicConditions}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </Card>

          {/* Footer Buttons */}
          <div style={styles.footer}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
