"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import {
  LogOut,
  Menu,
  User,
  LayoutDashboard,
  Settings,
  ChevronDown,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi, getStoredNurse } from "@/lib/api";
import { toast } from "sonner";

export function Header({ title, subtitle, showMenu = true, className = "" }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const nurse = getStoredNurse();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/nurse/dashboard" },
    { label: "Treatment Room", icon: User, href: "/nurse/all-patients" },
  ];

  return (
    <header
      className={`bg-[#0D9488] text-white shadow-md sticky top-0 z-50 w-full ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={Logo}
            alt="MedFlow Logo"
            width={124}
            height={49}
            className="w-full h-[49px] object-contain select-none cursor-pointer"
            priority
            onClick={() => router.push("/nurse/dashboard")}
          />
        </div>
        {title && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center hidden md:block">
            <h1 className="text-xl sm:text-3xl text-white font-bold leading-tight tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[#FAFAFF] text-sm font-normal opacity-90  tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          <div className="md:hidden text-right mr-2">
            <h1 className="text-sm font-bold">{title}</h1>
          </div>

          {showMenu && (
            <>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all duration-200 cursor-pointer `}
              >
                {isDropdownOpen ? (
                  <X className="w-11 h-8" />
                ) : (
                  <Menu className="w-11 h-8" />
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-60 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-5 bg-teal-50/50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/20">
                        <User className="text-white w-6 h-6" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-gray-900 font-bold text-base truncate">
                          {nurse?.fullName || "Nurse User"}
                        </span>
                        <span className="text-teal-600 text-xs font-semibold">
                          {nurse?.username || "@nurse"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    {navItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          if (item.href !== "#") router.push(item.href);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition-all cursor-pointer font-semibold text-sm group"
                      >
                        <item.icon className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                        {item.label}
                      </button>
                    ))}

                    <div className="h-px bg-gray-100 my-2 mx-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all cursor-pointer font-bold text-sm group"
                    >
                      <LogOut className="w-5 h-5 opacity-80" />
                      Logout Account
                    </button>
                  </div>
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      MedFlow ER System v1.0
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
