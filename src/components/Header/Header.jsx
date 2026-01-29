"use client";

import React from "react";

const Header = () => {
  return (
    <header className="bg-teal-600 text-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="bg-white rounded-full p-2 shadow-md">
            <div className="flex items-center gap-1">
              <span className="text-teal-600 font-bold text-sm">Med</span>
              <span className="text-teal-400 font-bold text-sm">Flow</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
            Triage Dashboard
          </h1>
          <p className="text-teal-100 text-sm mt-1">
            Manage patients in the ER
          </p>
        </div>

        {/* Menu Icon */}
        <button className="p-2 hover:bg-teal-700 rounded-lg transition-colors">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
