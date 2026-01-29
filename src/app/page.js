"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { User, ShieldCheck } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handlePatientClick = () => {
    router.push("/patient/register");
  };

  const handleNurseClick = () => {
    router.push("/nurse/login");
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "var(--color-bg-primary)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    },
    logoContainer: {
      width: "300px",
      height: "200px",
      backgroundColor: "rgba(240, 253, 250, 0.8)",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "24px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    },
    logoWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    logoMed: {
      fontSize: "48px",
      fontWeight: "700",
      color: "var(--color-primary)",
    },
    logoFlow: {
      fontSize: "48px",
      fontWeight: "700",
      color: "var(--color-primary-light)",
    },
    subtitle: {
      fontSize: "20px",
      color: "var(--color-text-secondary)",
      marginBottom: "48px",
      textAlign: "center",
    },
    cardsContainer: {
      display: "flex",
      gap: "24px",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    card: {
      width: "260px",
      padding: "32px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    },
    iconWrapper: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "16px",
    },
    patientIconWrapper: {
      backgroundColor: "rgba(20, 184, 166, 0.1)",
    },
    nurseIconWrapper: {
      backgroundColor: "rgba(139, 92, 246, 0.1)",
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "var(--color-text-primary)",
      marginBottom: "8px",
    },
    cardDescription: {
      fontSize: "14px",
      color: "var(--color-text-secondary)",
    },
  };

  return (
    <div style={styles.container}>
      {/* Logo */}
      <div style={styles.logoContainer}>
        <div style={styles.logoWrapper}>
          <span style={styles.logoMed}>Med</span>
          <span style={styles.logoFlow}>Flow</span>
        </div>
      </div>

      {/* Subtitle */}
      <p style={styles.subtitle}>Please select your role to continue</p>

      {/* Role Selection Cards */}
      <div style={styles.cardsContainer}>
        {/* Patient Card */}
        <Card
          style={styles.card}
          className="hover:shadow-lg hover:border-teal-300 transition-all"
          onClick={handlePatientClick}
        >
          <div style={{ ...styles.iconWrapper, ...styles.patientIconWrapper }}>
            <User className="w-8 h-8 text-teal-600" />
          </div>
          <h3 style={styles.cardTitle}>I am a Patient</h3>
          <p style={styles.cardDescription}>Register yourself for Triage.</p>
        </Card>

        {/* Nurse Card */}
        <Card
          style={styles.card}
          className="hover:shadow-lg hover:border-violet-300 transition-all"
          onClick={handleNurseClick}
        >
          <div style={{ ...styles.iconWrapper, ...styles.nurseIconWrapper }}>
            <ShieldCheck className="w-8 h-8 text-violet-600" />
          </div>
          <h3 style={styles.cardTitle}>I am a Nurse</h3>
          <p style={styles.cardDescription}>Manage triage queue and patient data.</p>
        </Card>
      </div>
    </div>
  );
}
