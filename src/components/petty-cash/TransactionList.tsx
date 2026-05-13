
"use client"

import { Transaction, CurrencyCode, CURRENCIES } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, FileText, Trash2, CalendarDays, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currencyCode: CurrencyCode;
}

export function TransactionList({ transactions, onDelete, currencyCode }: TransactionListProps) {
  const currency = CURRENCIES[currencyCode];

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-md text-center border">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground">No hay transacciones registradas</h3>
        <p className="text-sm text-muted-foreground/60">Registra un nuevo movimiento para comenzar el control.</p>
      </div>
    );
  }

  const getTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'cash_debit':
        return (
          <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200 gap-1.5 font-bold py-1 px-2.5">
            <Wallet className="h-3.5 w-3.5" />
            Cambio
          </Badge>
        );
      case 'reimbursement':
        return (
          <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200 gap-1.5 font-bold py-1 px-2.5">
            <FileText className="h-3.5 w-3.5" />
            Caja Chica
          </Badge>
        );
      case 'vales':
        return (
          <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 gap-1.5 font-bold py-1 px-2.5">
            <Ticket className="h-3.5 w-3.5" />
            Vale
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border">
      <div className="p-6 border-b bg-muted/10">
        <h3 className="text-lg font-bold">Historial de Movimientos</h3>
      </div>
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="font-black text-xs uppercase tracking-widest">Fecha</TableHead>
            <TableHead className="font-black text-xs uppercase tracking-widest">Tipo</TableHead>
            <TableHead className="font-black text-xs uppercase tracking-widest">Descripción</TableHead>
            <TableHead className="font-black text-xs uppercase tracking-widest text-right">Monto</TableHead>
            <TableHead className="font-black text-xs uppercase tracking-widest text-center">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} className="hover:bg-muted/5">
              <TableCell className="text-muted-foreground font-medium text-xs">
                {tx.date.toLocaleDateString()}
              </TableCell>
              <TableCell>
                {getTypeBadge(tx.type)}
              </TableCell>
              <TableCell>
                <span className="font-semibold text-sm">{tx.description}</span>
              </TableCell>
              <TableCell className="text-right font-black text-primary">
                {currency.symbol}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDelete(tx.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
