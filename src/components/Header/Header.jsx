"use client";

import React from "react";
import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({ title, subtitle, showMenu = true, className = "" }) {
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
            className="w-full h-[59px] object-contain"
          />
        </div>

        {/* Center Title */}
        {title && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center hidden md:block">
            <h1 className="text-xl font-bold leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-teal-100 text-xs opacity-90 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Title (visible only on small screens) */}
          <div className="md:hidden text-right mr-2">
            <h1 className="text-sm font-bold">{title}</h1>
          </div>

          {showMenu && (
            <button>
              <Menu className="w-11 h-8 text-[#FFFAFA]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
