
"use client"

import { ShieldCheck } from "lucide-react";

export function PettyCashHeader() {
  return (
    <header className="flex items-center justify-center p-6 bg-white border-b border-border shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <ShieldCheck className="h-7 w-7 text-slate-300" />
        </div>
        <h1 className="text-3xl font-[900] font-headline tracking-tighter text-slate-500 uppercase">Contraloria GC</h1>
      </div>
    </header>
  );
}
