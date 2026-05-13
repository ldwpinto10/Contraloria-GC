"use client"

import { useState } from "react";
import { PlusCircle, Wallet, FileText, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransactionType, CurrencyCode, CURRENCIES } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DenominationCalculator } from "./DenominationCalculator";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  onAdd: (transaction: { type: TransactionType; description: string; amount: number }) => void;
  currencyCode: CurrencyCode;
}

export function TransactionForm({ onAdd, currencyCode }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("cash_debit");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  const currency = CURRENCIES[currencyCode];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || isNaN(parseFloat(amount))) return;
    
    onAdd({
      type,
      description,
      amount: parseFloat(amount)
    });

    setDescription("");
    setAmount("");
  };

  const handleCalcConfirm = (total: number) => {
    setAmount(total.toString());
    setIsCalcOpen(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-border">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
        <PlusCircle className="h-5 w-5" />
        Registrar Movimiento
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tipo de Movimiento</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant={type === 'cash_debit' ? 'default' : 'outline'}
              className={cn(
                "h-14 font-bold text-base transition-all",
                type === 'cash_debit' ? "bg-orange-600 hover:bg-orange-700" : "hover:bg-orange-50 border-orange-200"
              )}
              onClick={() => setType('cash_debit')}
            >
              <Wallet className="h-5 w-5 mr-2" />
              Fondo para cambio
            </Button>
            <Button
              type="button"
              variant={type === 'reimbursement' ? 'default' : 'outline'}
              className={cn(
                "h-14 font-bold text-base transition-all",
                type === 'reimbursement' ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-purple-50 border-purple-200"
              )}
              onClick={() => setType('reimbursement')}
            >
              <FileText className="h-5 w-5 mr-2" />
              Fondo Caja Chica
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase">Concepto / Descripción</Label>
            <Input 
              id="description" 
              placeholder="Ej. Papelería, Almuerzo..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-bold text-muted-foreground uppercase flex justify-between items-center">
              Monto ({currency.symbol})
              <Dialog open={isCalcOpen} onOpenChange={setIsCalcOpen}>
                <DialogTrigger asChild>
                  <button type="button" className="text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                    <Calculator className="h-4 w-4" />
                    <span className="text-xs font-bold">Calculadora</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Conteo de {currency.name}
                    </DialogTitle>
                  </DialogHeader>
                  <DenominationCalculator onConfirm={handleCalcConfirm} currencyCode={currencyCode} />
                </DialogContent>
              </Dialog>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">{currency.symbol}</span>
              <Input 
                id="amount" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background font-black text-primary pl-8 h-12 text-lg"
              />
            </div>
          </div>

          <Button type="submit" className="h-12 font-black shadow-lg hover:scale-[1.02] transition-transform bg-primary">
            REGISTRAR
          </Button>
        </div>
      </form>
    </div>
  );
}