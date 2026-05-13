
"use client"

import { useState, useEffect, useMemo, useCallback } from "react";
import { CurrencyCode, CURRENCIES, ArqueoCardEntry, ArqueoCashEntry } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Hash, 
  Store, 
  LayoutDashboard,
  Plus,
  CircleDollarSign,
  CreditCard,
  Banknote,
  Trash2,
  Calculator,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArqueoReportDialog } from "@/components/petty-cash/ArqueoReportDialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CuadreArqueosPage() {
  const [currency, setCurrency] = useState<CurrencyCode>('HNL');
  const [unitBrand, setUnitBrand] = useState<string>("");
  const [unitNumber, setUnitNumber] = useState("");
  const [cardEntries, setCardEntries] = useState<ArqueoCardEntry[]>([]);
  const [cashEntries, setCashEntries] = useState<ArqueoCashEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("contraloria_gc_arqueos_v1_reported");
      const saved = localStorage.getItem("contraloria_gc_arqueos_v1");
      if (saved) {
        const data = JSON.parse(saved);
        setCurrency(data.currency || 'HNL');
        setUnitBrand(data.unitBrand || "");
        setUnitNumber(data.unitNumber || "");
        setCardEntries(data.cardEntries || []);
        setCashEntries(data.cashEntries || []);
      }
    } catch (e) {
      console.warn("Storage error", e);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const data = {
      currency,
      unitBrand,
      unitNumber,
      cardEntries,
      cashEntries
    };
    const timer = setTimeout(() => {
      localStorage.setItem("contraloria_gc_arqueos_v1", JSON.stringify(data));
    }, 500);
    return () => clearTimeout(timer);
  }, [currency, unitBrand, unitNumber, cardEntries, cashEntries, isMounted]);

  const cardTotals = useMemo(() => {
    return cardEntries.reduce((acc, row) => {
      const cp = parseFloat(row.cierrePos) || 0;
      const sis = parseFloat(row.sistema) || 0;
      return {
        cierre: acc.cierre + cp,
        sistema: acc.sistema + sis,
        diff: acc.diff + (cp - sis)
      };
    }, { cierre: 0, sistema: 0, diff: 0 });
  }, [cardEntries]);

  const cashTotals = useMemo(() => {
    return cashEntries.reduce((acc, row) => {
      const vent = parseFloat(row.ventaSd) || 0;
      const ent = parseFloat(row.entrega) || 0;
      return {
        venta: acc.venta + vent,
        entrega: acc.entrega + ent,
        diff: acc.diff + (ent - vent)
      };
    }, { venta: 0, entrega: 0, diff: 0 });
  }, [cashEntries]);

  const totals = useMemo(() => {
    const totalVentaSistema = cardTotals.sistema + cashTotals.venta;
    const totalVentaEntregada = cardTotals.cierre + cashTotals.entrega;
    const totalDiff = totalVentaEntregada - totalVentaSistema;
    return { totalVentaSistema, totalVentaEntregada, totalDiff };
  }, [cardTotals, cashTotals]);

  const currentCurrency = CURRENCIES[currency];
  const format = useCallback((val: number) => {
    const formatted = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${val < 0 ? '-' : ''}${currentCurrency.symbol}${formatted}`;
  }, [currentCurrency.symbol]);

  const updateCardRow = useCallback((id: string, field: keyof ArqueoCardEntry, value: string) => {
    setCardEntries(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  }, []);

  const updateCashRow = useCallback((id: string, field: keyof ArqueoCashEntry, value: string) => {
    setCashEntries(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  }, []);

  const deleteCardRow = useCallback((id: string) => setCardEntries(prev => prev.filter(r => r.id !== id)), []);
  const deleteCashRow = useCallback((id: string) => setCashEntries(prev => prev.filter(r => r.id !== id)), []);

  const addRowSincronizado = useCallback(() => {
    const timestamp = Date.now().toString();
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    setCardEntries(prev => [...prev, { id: timestamp + "-card", date: dateStr, cierrePos: "", sistema: "" }]);
    setCashEntries(prev => [...prev, { id: timestamp + "-cash", date: dateStr, ventaSd: "", entrega: "" }]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-1 container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-[900] text-slate-800 tracking-tighter uppercase leading-none whitespace-nowrap">
              Contraloria <span className="text-primary">GC</span>
            </h2>
          </div>
          <Link href="/" prefetch={true}>
            <div className="inline-flex items-center gap-2 font-black text-muted-foreground hover:text-primary transition-colors cursor-pointer group bg-white px-4 py-2 rounded-full border shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-[0.2em]">MENÚ PRINCIPAL</span>
            </div>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 flex items-center gap-3 w-fit mx-auto">
            <CircleDollarSign className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest leading-none">Módulo Activo</p>
              <p className="text-xs font-bold text-orange-700">CUADRE ARQUEOS SD</p>
            </div>
          </div>

          <div className="bg-orange-50 p-5 rounded-xl shadow-sm border border-orange-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Store className="h-3 w-3" />Marca</Label>
                <Select value={unitBrand} onValueChange={setUnitBrand}>
                  <SelectTrigger className="h-10 font-bold bg-white border-orange-100"><SelectValue placeholder="Marca" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pizza Hut">Pizza Hut</SelectItem>
                    <SelectItem value="KFC">KFC</SelectItem>
                    <SelectItem value="Dennys">Dennys</SelectItem>
                    <SelectItem value="China Wok">China Wok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Hash className="h-3 w-3" />Unidad</Label>
                <input 
                  type="text" 
                  placeholder="Ej. 60" 
                  value={unitNumber} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (!val) { setUnitNumber(""); return; }
                    const num = parseInt(val, 10);
                    setUnitNumber(num < 10 ? `0${num}` : num.toString());
                  }} 
                  className="flex h-10 w-full rounded-md border border-orange-100 bg-white px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CircleDollarSign className="h-3 w-3" />Moneda</Label>
                <Select value={currency} onValueChange={(val: CurrencyCode) => setCurrency(val)}>
                  <SelectTrigger className="h-10 font-bold bg-white border-orange-100"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(CURRENCIES).map((c) => (<SelectItem key={c.code} value={c.code}>{c.symbol} - {c.code}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Card className="shadow-md border-none overflow-hidden rounded-xl bg-white flex flex-col">
              <div className="bg-slate-800 p-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-orange-500" />
                  <h3 className="font-black uppercase tracking-tight text-xs text-orange-500">CONTROL DE TARJETAS</h3>
                </div>
                <Button onClick={addRowSincronizado} size="sm" variant="secondary" className="h-7 text-[10px] font-black uppercase"><Plus className="h-3 w-3 mr-1" /> FECHA</Button>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50 border-b">
                    <TableRow className="h-10">
                      <TableHead className="font-black text-[10px] uppercase text-center w-32">FECHA</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center border-x">TARJETA SD</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center">CIERRE POS</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cardEntries.map((row) => (
                      <TableRow key={row.id} className="h-12 border-b">
                        <TableCell className="p-1 w-32">
                          <input 
                            value={row.date} 
                            onChange={(e) => updateCardRow(row.id, 'date', e.target.value)} 
                            className="flex h-8 w-full rounded-md border-none bg-transparent px-3 py-2 text-[11px] text-center font-bold focus-visible:outline-none focus-visible:ring-0"
                          />
                        </TableCell>
                        <TableCell className="p-1 border-x">
                          <input 
                            type="number" 
                            value={row.sistema} 
                            onChange={(e) => updateCardRow(row.id, 'sistema', e.target.value)} 
                            className="flex h-8 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-[11px] text-center font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input 
                            type="number" 
                            value={row.cierrePos} 
                            onChange={(e) => updateCardRow(row.id, 'cierrePos', e.target.value)} 
                            className="flex h-8 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-[11px] text-center font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        </TableCell>
                        <TableCell className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => deleteCardRow(row.id)} className="h-7 w-7 text-slate-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <div className="bg-slate-50 p-3 border-t flex justify-between items-center px-6">
                <span className="text-[10px] font-black uppercase text-slate-500">Subtotal Diferencia:</span>
                <span className={cn("font-black text-sm", cardTotals.diff < 0 ? "text-red-600" : "text-green-600")}>{format(cardTotals.diff)}</span>
              </div>
            </Card>

            <Card className="shadow-md border-none overflow-hidden rounded-xl bg-white flex flex-col">
              <div className="bg-slate-800 p-3 text-white flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-orange-500" />
                  <h3 className="font-black uppercase tracking-tight text-xs text-orange-500">CONTROL DE EFECTIVO</h3>
                </div>
                <Button onClick={addRowSincronizado} size="sm" variant="secondary" className="h-7 text-[10px] font-black uppercase"><Plus className="h-3.5 w-3.5 mr-1" /> FECHA</Button>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50 border-b">
                    <TableRow className="h-10">
                      <TableHead className="font-black text-[10px] uppercase text-center w-32">FECHA</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center border-x">EFECTIVO SD</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center">DEPOSITO BANCO</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashEntries.map((row) => (
                      <TableRow key={row.id} className="h-12 border-b">
                        <TableCell className="p-1 w-32">
                          <input 
                            value={row.date} 
                            onChange={(e) => updateCashRow(row.id, 'date', e.target.value)} 
                            className="flex h-8 w-full rounded-md border-none bg-transparent px-3 py-2 text-[11px] text-center font-bold focus-visible:outline-none focus-visible:ring-0"
                          />
                        </TableCell>
                        <TableCell className="p-1 border-x">
                          <input 
                            type="number" 
                            value={row.ventaSd} 
                            onChange={(e) => updateCashRow(row.id, 'ventaSd', e.target.value)} 
                            className="flex h-8 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-[11px] text-center font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input 
                            type="number" 
                            value={row.entrega} 
                            onChange={(e) => updateCashRow(row.id, 'entrega', e.target.value)} 
                            className="flex h-8 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-[11px] text-center font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        </TableCell>
                        <TableCell className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => deleteCashRow(row.id)} className="h-7 w-7 text-slate-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <div className="bg-slate-50 p-3 border-t flex justify-between items-center px-6">
                <span className="text-[10px] font-black uppercase text-slate-500">Subtotal Diferencia:</span>
                <span className={cn("font-black text-sm", cashTotals.diff < 0 ? "text-red-600" : "text-green-600")}>{format(cashTotals.diff)}</span>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-white border-2 border-slate-100 shadow-lg rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-slate-900 p-4 text-white flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-orange-400" />
                  <h3 className="font-black uppercase tracking-widest text-sm text-orange-500">Resumen de Cuadre Total</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center items-start">
                  <div className="space-y-1 py-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Venta Sistema</p>
                    <p className="text-xl font-black text-slate-900">{format(totals.totalVentaSistema)}</p>
                  </div>
                  <div className="space-y-1 py-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Depositado</p>
                    <p className="text-xl font-black text-slate-900">{format(totals.totalVentaEntregada)}</p>
                  </div>
                  <div className={cn(
                    "rounded-xl transition-colors py-1 flex flex-col justify-center min-h-[56px] border-2",
                    Math.abs(totals.totalDiff) < 0.01 ? "bg-green-50 border-green-100" : totals.totalDiff > 0 ? "bg-blue-50 border-blue-100" : "bg-red-50 border-red-100"
                  )}>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      Math.abs(totals.totalDiff) < 0.01 ? "text-green-600" : totals.totalDiff > 0 ? "text-blue-600" : "text-red-600"
                    )}>Diferencia</p>
                    <p className={cn("text-2xl font-black leading-tight", Math.abs(totals.totalDiff) < 0.01 ? "text-green-600" : totals.totalDiff > 0 ? "text-blue-600" : "text-red-600")}>{format(totals.totalDiff)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <ArqueoReportDialog cardEntries={cardEntries} cashEntries={cashEntries} unitBrand={unitBrand} unitNumber={unitNumber} currencyCode={currency} />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] mt-auto">
        <p>2026 CONTRALORÍA GRUPO COMIDAS • CGC SISTEMA DE CONTROLES OPERATIVOS. LP</p>
      </footer>
    </div>
  );
}
