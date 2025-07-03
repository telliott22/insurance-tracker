import React from "react";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-semibold text-white">Insurance Tracker</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-slate-400 text-sm">
            <p>Built with Next.js, Supabase, and OpenAI</p>
            <p>Made with ❤️ in Berlin</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
