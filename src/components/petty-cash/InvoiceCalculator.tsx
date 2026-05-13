"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CurrencyCode, CURRENCIES } from "@/types";
import { cn } from "@/lib/utils";

interface InvoiceCalculatorProps {
  onConfirm: (total: number, values: string[]) => void;
  onCancel?: () => void;
  currencyCode: CurrencyCode;
  color?: 'purple' | 'sky';
  initialValues?: string[];
}

export function InvoiceCalculator({ onConfirm, onCancel, currencyCode, color = 'purple', initialValues }: InvoiceCalculatorProps) {
  const [invoices, setInvoices] = useState<string[]>(initialValues || Array(10).fill(""));
  const [total, setTotal] = useState(0);
  
  const currency = CURRENCIES[currencyCode];

  useEffect(() => {
    const newTotal = invoices.reduce((acc, val) => {
      const num = parseFloat(val);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    setTotal(newTotal);
  }, [invoices]);

  const handleValueChange = (index: number, val: string) => {
    const newInvoices = [...invoices];
    newInvoices[index] = val;
    setInvoices(newInvoices);
  };

  const reset = () => {
    setInvoices(Array(10).fill(""));
  };

  const isPurple = color === 'purple';

  return (
    <div className="flex flex-col h-[420px] md:h-[450px]">
      <ScrollArea className="flex-1 pr-3 mb-4 border rounded-xl bg-white p-3 shadow-inner">
        <div className="space-y-3 p-1">
          {invoices.map((val, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all border shrink-0",
                isPurple ? "bg-purple-50 text-purple-400 group-focus-within:bg-purple-600 group-focus-within:text-white border-purple-100" : "bg-sky-50 text-sky-400 group-focus-within:bg-sky-600 group-focus-within:text-white border-sky-100"
              )}>
                {idx + 1}
              </div>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-300">{currency.symbol}</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  value={val}
                  onChange={(e) => handleValueChange(idx, e.target.value)}
                  className={cn(
                    "h-10 pl-8 font-black text-[13px] border-slate-100 bg-slate-50/50",
                    isPurple ? "focus-visible:ring-purple-500" : "focus-visible:ring-sky-500"
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 bg-slate-900 rounded-2xl space-y-4 shadow-2xl shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
            <h3 className={cn(
              "text-2xl font-black tabular-nums",
              isPurple ? "text-purple-400" : "text-sky-400"
            )}>
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
            onClick={() => onConfirm(total, invoices)} 
            className={cn(
              "flex-[2] gap-2 font-black text-[11px] h-11 shadow-lg uppercase tracking-widest text-white border-none",
              isPurple ? "bg-purple-600 hover:bg-purple-700" : "bg-sky-600 hover:bg-sky-700"
            )}
          >
            <Save className="h-4 w-4" />
            GUARDAR
          </Button>
        </div>
      </div>
    </div>
  );
}