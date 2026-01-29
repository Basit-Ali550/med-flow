"use client";

import Link from "next/link";
import { Stethoscope, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center">
          <Stethoscope className="w-12 h-12 text-teal-600" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-gray-500 text-lg">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
          </p>
        </div>

        {/* Action */}
        <div className="pt-4">
          <Link href="/">
            <Button className="rounded-full bg-teal-600 hover:bg-teal-700 text-white px-8 h-12 shadow-lg shadow-teal-600/20 cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-8 text-gray-400 text-sm">
        MedFlow System
      </div>
    </div>
  );
}
