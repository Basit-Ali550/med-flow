"use client";

import React from "react";
import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export function Header({ title, subtitle, showMenu = true, className = "" }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("nurse");
      toast.success("Logged out successfully");
      router.push("/nurse/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <header
      className={`bg-[#0D9488] text-white shadow-md sticky top-0 z-50 w-full ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <Image
            src={Logo}
            alt="MedFlow Logo"
            width={124}
            height={59}
            className="w-full h-[59px] object-contain select-none"
            priority
          />
        </div>

        {/* Center Title */}
        {title && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center hidden md:block">
            <h1 className="text-xl font-bold leading-tight tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-teal-100 text-xs opacity-90 font-medium tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile Title */}
          <div className="md:hidden text-right mr-2">
            <h1 className="text-sm font-bold">{title}</h1>
          </div>

          {showMenu && (
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-teal-50 group-hover:text-white" />
              <span className="hidden sm:inline text-sm font-semibold text-teal-50 group-hover:text-white">
                Logout
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
