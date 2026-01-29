"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

export default function NurseLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: API call to login
      console.log("Login data:", formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Login successful!");
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push("/nurse/dashboard");
      }, 1000);
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
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
    iconWrapper: {
      marginBottom: "32px",
    },
    form: {
      width: "100%",
      maxWidth: "360px",
    },
    formGroup: {
      marginBottom: "20px",
    },
    buttonWrapper: {
      display: "flex",
      justifyContent: "center",
      marginTop: "32px",
    },
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-center" richColors />

      {/* Login Icon */}
      <div style={styles.iconWrapper}>
        <LogIn className="w-16 h-16 text-teal-600" strokeWidth={1.5} />
      </div>

      {/* Login Form */}
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Type in your Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        <div style={styles.formGroup}>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Type in your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        <div style={styles.buttonWrapper}>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-700 px-8"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
    </div>
  );
}
