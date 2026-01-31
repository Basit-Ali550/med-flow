"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  Loader2, Eye, EyeOff } from "lucide-react";
import { authApi, isAuthenticated } from "@/lib/api";
import { handleClientError } from "@/lib/error-handler";
import Image from "next/image";
import Login from "@/assets/Icon/Login.svg"
import { Card } from "@/components";
export default function NurseLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/nurse/dashboard");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

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
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    
 <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 shadow-xl bg-white rounded-3xl border-0">
   <div className="flex justify-center">
      <Image src={Login} alt="Logo" width={100} height={100} />
   </div>

      {/* Login Form */}
      <form className="w-full max-w-xl" onSubmit={handleSubmit}>
        <div className="my-8">
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

        <div className="mb-4">
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Type in your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
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
    </Card>
    </div>
  );
}


