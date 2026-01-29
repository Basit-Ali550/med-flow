"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function PatientSuccess() {
  const router = useRouter();

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "var(--color-bg-primary)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      textAlign: "center",
    },
    iconWrapper: {
      marginBottom: "24px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "600",
      color: "var(--color-text-primary)",
      marginBottom: "12px",
    },
    description: {
      fontSize: "16px",
      color: "var(--color-text-secondary)",
      marginBottom: "32px",
      maxWidth: "400px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        <CheckCircle className="w-20 h-20 text-teal-600" />
      </div>
      <h1 style={styles.title}>Registration Complete!</h1>
      <p style={styles.description}>
        Your registration has been submitted successfully. A nurse will call you shortly for triage.
      </p>
      <Button
        onClick={() => router.push("/")}
        className="bg-teal-600 hover:bg-teal-700"
      >
        Back to Home
      </Button>
    </div>
  );
}
