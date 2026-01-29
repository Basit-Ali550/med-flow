"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function AppHeader() {
  const pathname = usePathname();

  // Define route configurations
  // We can use precise matches or checks
  let config = null;

  if (pathname === "/nurse/dashboard") {
    config = {
      title: "Triage Dashboard",
      subtitle: "Manage patients in the ER",
      showMenu: true,
    };
  } else if (pathname === "/nurse/add-patient") {
    config = {
      title: "Add Patient",
      subtitle: "Please fill in all relevant medical information.",
      showMenu: false,
    };
  } else if (pathname?.startsWith("/nurse/edit-patient/")) {
    config = {
      title: "Edit Patient",
      subtitle: "Update patient information",
      showMenu: false,
    };
  } else if (pathname?.startsWith("/patient/register")) {
    config = {
      title: "Patient Registration",
      subtitle: "Please fill in all relevant medical information.",
      showMenu: false,
    };
  }
  // Add other pages if needed, e.g. Login might not need header
  // or return null to hide header

  if (!config) {
    return null;
  }

  return (
    <Header
      title={config.title}
      subtitle={config.subtitle}
      showMenu={config.showMenu}
    />
  );
}
