"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Landmark, ReceiptText, Wallet, Scale } from "lucide-react";
import { CurrencyCode, CURRENCIES } from "@/types";

interface BalanceCardsProps {
  initialValue: number;
  totalDebits: number;
  totalReimbursements: number;
  expectedCash: number;
  currencyCode: CurrencyCode;
}

export function BalanceCards({ 
  initialValue, 
  totalDebits, 
  totalReimbursements, 
  expectedCash, 
  currencyCode 
}: BalanceCardsProps) {
  const currency = CURRENCIES[currencyCode];

  const format = (val: number) => {
    return `${currency.symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white border-none shadow-md overflow-hidden">
        <CardContent className="p-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Fondo Asignado</p>
            <h3 className="text-xl font-bold text-primary">{format(initialValue)}</h3>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            <Landmark className="h-4 w-4 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-none shadow-md overflow-hidden">
        <CardContent className="p-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Fondo para cambio</p>
            <h3 className="text-xl font-bold text-orange-600">-{format(totalDebits)}</h3>
          </div>
          <div className="bg-orange-50 p-2 rounded-full">
            <Wallet className="h-4 w-4 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-none shadow-md overflow-hidden">
        <CardContent className="p-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Fondo Caja Chica</p>
            <h3 className="text-xl font-bold text-blue-500">-{format(totalReimbursements)}</h3>
          </div>
          <div className="bg-blue-50 p-2 rounded-full">
            <ReceiptText className="h-4 w-4 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary text-primary-foreground shadow-lg border-none overflow-hidden">
        <CardContent className="p-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-tight mb-1">Total</p>
            <h3 className="text-xl font-bold">{format(expectedCash)}</h3>
          </div>
          <div className="bg-white/20 p-2 rounded-full">
            <Scale className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}