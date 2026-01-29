"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { authApi } from "@/lib/api";

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
      const { data } = await authApi.login(formData);

      // Store token in localStorage for client-side access
      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('nurse', JSON.stringify(data.nurse));
      }

      toast.success("Login successful!");
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push("/nurse/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">
      {/* Login Icon */}
      <div className="mb-8">
        <LogIn className="w-16 h-16 text-teal-600" strokeWidth={1.5} />
      </div>

      {/* Login Form */}
      <form className="w-full max-w-sm" onSubmit={handleSubmit}>
        <div className="mb-5">
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

        <div className="mb-5">
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

        <div className="flex justify-center mt-8">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-700 px-8 cursor-pointer shadow-md shadow-teal-600/20 active:scale-95 transition-transform"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
    </div>
  );
}

