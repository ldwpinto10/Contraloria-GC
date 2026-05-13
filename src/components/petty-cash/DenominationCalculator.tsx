"use client"

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CurrencyCode, CURRENCIES } from "@/types";

interface Denomination {
  label: string;
  value: number;
}

const DENOMINATIONS_BY_CURRENCY: Record<CurrencyCode, Denomination[]> = {
  USD: [
    { label: "100.00", value: 100 },
    { label: "50.00", value: 50 },
    { label: "20.00", value: 20 },
    { label: "10.00", value: 10 },
    { label: "5.00", value: 5 },
    { label: "1.00", value: 1 },
    { label: "0.25", value: 0.25 },
    { label: "0.10", value: 0.1 },
    { label: "0.05", value: 0.05 },
  ],
  HNL: [
    { label: "500.00", value: 500 },
    { label: "200.00", value: 200 },
    { label: "100.00", value: 100 },
    { label: "50.00", value: 50 },
    { label: "20.00", value: 20 },
    { label: "10.00", value: 10 },
    { label: "5.00", value: 5 },
    { label: "2.00", value: 2 },
    { label: "1.00", value: 1 },
  ],
  GTQ: [
    { label: "200.00", value: 200 },
    { label: "100.00", value: 100 },
    { label: "50.00", value: 50 },
    { label: "20.00", value: 20 },
    { label: "10.00", value: 10 },
    { label: "5.00", value: 5 },
    { label: "1.00", value: 1 },
    { label: "0.50", value: 0.5 },
    { label: "0.25", value: 0.25 },
    { label: "0.10", value: 0.1 },
  ],
};

interface DenominationCalculatorProps {
  onConfirm: (total: number, counts: Record<string, string>) => void;
  onCancel?: () => void;
  currencyCode: CurrencyCode;
  initialCounts?: Record<string, string>;
}

export function DenominationCalculator({ onConfirm, onCancel, currencyCode, initialCounts = {} }: DenominationCalculatorProps) {
  const [counts, setCounts] = useState<Record<string, string>>(initialCounts);
  const [total, setTotal] = useState(0);
  
  const currency = CURRENCIES[currencyCode];
  const denominations = useMemo(() => DENOMINATIONS_BY_CURRENCY[currencyCode], [currencyCode]);

  useEffect(() => {
    const newTotal = denominations.reduce((acc, den) => {
      const count = parseInt(counts[den.label] || "0");
      return acc + (isNaN(count) ? 0 : count * den.value);
    }, 0);
    setTotal(newTotal);
  }, [counts, denominations]);

  const handleCountChange = (label: string, val: string) => {
    setCounts(prev => ({ ...prev, [label]: val }));
  };

  const reset = () => {
    setCounts({});
  };

  return (
    <div className="flex flex-col h-[420px] md:h-[450px]">
      <ScrollArea className="flex-1 pr-3 mb-4 border rounded-xl bg-white p-1 shadow-inner">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10">
            <TableRow className="h-8">
              <TableHead className="w-[80px] px-3 text-[10px] uppercase font-black tracking-widest text-slate-500">Billete</TableHead>
              <TableHead className="px-3 text-[10px] uppercase font-black tracking-widest text-center text-slate-500">Cant.</TableHead>
              <TableHead className="text-right px-3 text-[10px] uppercase font-black tracking-widest text-slate-500">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {denominations.map((den) => {
              const count = parseInt(counts[den.label] || "0");
              const subtotal = isNaN(count) ? 0 : count * den.value;
              return (
                <TableRow key={den.label} className="h-10 hover:bg-slate-50 transition-colors">
                  <TableCell className="font-black text-primary px-3 text-[11px] py-1 border-r border-slate-100">
                    {currency.symbol}{den.label}
                  </TableCell>
                  <TableCell className="px-2 py-1">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      placeholder="0"
                      value={counts[den.label] || ""}
                      onChange={(e) => handleCountChange(den.label, e.target.value)}
                      className="w-full h-8 text-[11px] font-black px-1 text-center border-slate-200 focus-visible:ring-primary bg-slate-50/50"
                    />
                  </TableCell>
                  <TableCell className="text-right font-black px-3 text-[11px] py-1 tabular-nums text-slate-700">
                    {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="p-4 bg-slate-900 rounded-2xl space-y-4 shadow-2xl shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Conteo</p>
            <h3 className="text-2xl font-black text-primary tabular-nums">
              {currency.symbol}{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <Button variant="outline" size="icon" onClick={reset} className="h-9 w-9 rounded-full border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 bg-transparent">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1 font-black text-[11px] h-11 border-slate-700 text-slate-300 uppercase tracking-widest hover:bg-slate-800"
            >
              <X className="h-4 w-4 mr-1" />
              SALIR
            </Button>
          )}
          <Button 
            onClick={() => onConfirm(total, counts)} 
            className="flex-[2] gap-2 font-black text-[11px] h-11 bg-primary hover:bg-primary/90 shadow-lg uppercase tracking-widest"
          >
            <Save className="h-4 w-4" />
            GUARDAR
          </Button>
        </div>
      </div>
    </div>
  );
}