
"use client"

import { useState, useEffect, useMemo, useCallback } from "react";
import { CurrencyCode, CURRENCIES, KioskoEntry } from "@/types";
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
  Trash2,
  Calculator,
  ShieldCheck,
  CircleDollarSign,
  Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { KioskoReportDialog } from "@/components/petty-cash/KioskoReportDialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CuadreKioskosPage() {
  const [currency] = useState<CurrencyCode>('HNL');
  const [unitBrand, setUnitBrand] = useState<string>("Pizza Hut");
  const [unitNumber, setUnitNumber] = useState("");
  const [storeUnit, setStoreUnit] = useState("");
  const [entries, setEntries] = useState<KioskoEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("contraloria_gc_kioskos_v2_reported");
      const saved = localStorage.getItem("contraloria_gc_kioskos_v2");
      if (saved) {
        const data = JSON.parse(saved);
        setUnitBrand(data.unitBrand || "Pizza Hut");
        setStoreUnit(data.storeUnit || "");
        setUnitNumber(data.unitNumber || "");
        setEntries(data.entries || []);
      } else {
        setUnitBrand("Pizza Hut");
      }
    } catch (e) {
      console.warn("Storage error", e);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const data = {
      unitBrand,
      unitNumber,
      storeUnit,
      entries
    };
    const timer = setTimeout(() => {
      localStorage.setItem("contraloria_gc_kioskos_v2", JSON.stringify(data));
    }, 500);
    return () => clearTimeout(timer);
  }, [unitBrand, unitNumber, storeUnit, entries, isMounted]);

  const entryTotals = useMemo(() => {
    return entries.reduce((acc, row) => {
      const fact = parseFloat(row.facturado) || 0;
      const red = parseFloat(row.reducciones) || 0;
      const efec = parseFloat(row.efectivo) || 0;
      const tarj = parseFloat(row.tarjeta) || 0;
      const diff = (efec + tarj) - (fact - red);
      return {
        facturado: acc.facturado + fact,
        reducciones: acc.reducciones + red,
        efectivo: acc.efectivo + efec,
        tarjeta: acc.tarjeta + tarj,
        diff: acc.diff + diff
      };
    }, { facturado: 0, reducciones: 0, efectivo: 0, tarjeta: 0, diff: 0 });
  }, [entries]);

  const isCuadrado = Math.abs(entryTotals.diff) < 0.01;
  const isSobrante = entryTotals.diff >= 0.01;
  const isFaltante = entryTotals.diff <= -0.01;

  const currentCurrency = CURRENCIES[currency];
  const format = useCallback((val: number) => {
    const formatted = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${val < -0.001 ? '-' : ''}${currentCurrency.symbol}${formatted}`;
  }, [currentCurrency.symbol]);

  const updateEntryRow = useCallback((id: string, field: keyof KioskoEntry, value: string) => {
    setEntries(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  }, []);

  const deleteEntryRow = useCallback((id: string) => setEntries(prev => prev.filter(r => r.id !== id)), []);

  const addEntryRow = useCallback(() => {
    const timestamp = Date.now().toString();
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    setEntries(prev => [...prev, { 
      id: timestamp, 
      date: dateStr, 
      facturado: "", 
      reducciones: "",
      efectivo: "", 
      tarjeta: "" 
    }]);
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
          <Link href="/" prefetch={true} className="transition-none">
            <div className="inline-flex items-center gap-2 font-black text-muted-foreground hover:text-primary transition-none cursor-pointer group bg-white px-4 py-2 rounded-full border shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-[0.2em]">MENÚ PRINCIPAL</span>
            </div>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="bg-sky-50 px-4 py-2 rounded-lg border border-sky-100 flex items-center gap-3 w-fit mx-auto">
            <Store className="h-5 w-5 text-sky-500" />
            <div>
              <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest leading-none">Módulo Activo</p>
              <p className="text-xs font-bold text-sky-700">CUADRE CAJA KIOSKOS</p>
            </div>
          </div>

          <div className="bg-sky-50 p-5 rounded-xl shadow-sm border border-sky-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Store className="h-3 w-3" />Marca</Label>
                <Select value={unitBrand} onValueChange={setUnitBrand}>
                  <SelectTrigger className="h-10 font-bold bg-white border-sky-100"><SelectValue placeholder="Marca" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pizza Hut">Pizza Hut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Hash className="h-3 w-3" />Unidad</Label>
                <input 
                  type="text" 
                  placeholder="Ej. 60" 
                  value={storeUnit} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (!val) { setStoreUnit(""); return; }
                    const num = parseInt(val, 10);
                    setStoreUnit(num < 10 ? `0${num}` : num.toString());
                  }} 
                  className="flex h-10 w-full rounded-md border border-sky-100 bg-white px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Hash className="h-3 w-3" />Kiosko #</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-sky-600">KSK-</span>
                  <input 
                    type="text" 
                    placeholder="00" 
                    value={unitNumber.startsWith('KSK-') ? unitNumber.substring(4) : unitNumber} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (!val) { setUnitNumber(""); return; }
                      const num = parseInt(val, 10);
                      const formattedNum = num < 10 ? `0${num}` : num.toString();
                      setUnitNumber(`KSK-${formattedNum}`);
                    }} 
                    className="flex h-10 w-full rounded-md border border-sky-100 bg-white pl-12 pr-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <Card className="shadow-md border-none overflow-hidden rounded-xl bg-white flex flex-col">
            <div className="bg-slate-800 p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-sky-500" />
                <h3 className="font-black uppercase tracking-tight text-xs text-sky-500">CONTROL DE VENTAS KIOSKO</h3>
              </div>
              <Button onClick={addEntryRow} size="sm" variant="secondary" className="h-7 text-[10px] font-black uppercase"><Plus className="h-3 w-3 mr-1" /> AÑADIR FECHA</Button>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 border-b">
                    <TableRow className="h-10">
                      <TableHead className="font-black text-[10px] uppercase text-center w-32">FECHA</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center border-x">FACTURADO</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center">EFECTIVO</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center border-x">TARJETA POS</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center">REDUCCIONES</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center border-l">DIFERENCIA</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((row) => {
                      const fact = parseFloat(row.facturado) || 0;
                      const red = parseFloat(row.reducciones) || 0;
                      const efec = parseFloat(row.efectivo) || 0;
                      const tarj = parseFloat(row.tarjeta) || 0;
                      const diff = (efec + tarj) - (fact - red);
                      
                      return (
                        <TableRow key={row.id} className="h-12 border-b">
                          <TableCell className="p-1 w-32">
                            <input 
                              value={row.date} 
                              onChange={(e) => updateEntryRow(row.id, 'date', e.target.value)} 
                              className="flex h-8 w-full rounded-md border-none bg-transparent px-3 py-2 text-[11px] text-center font-bold focus-visible:outline-none focus-visible:ring-0"
                            />
                          </TableCell>
                          <TableCell className="p-1 border-x">
                            <input 
                              type="number" 
                              value={row.facturado} 
                              onChange={(e) => updateEntryRow(row.id, 'facturado', e.target.value)} 
                              className="flex h-8 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-[11px] text-center font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="p-1">
                            <input 
                              type="number" 
                              value={row.efectivo} 
                              onChange={(e) => updateEntryRow(row.id, 'efectivo', e.target.value)} 
                              className="flex h-8 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-[11px] text-center font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="p-1 border-x">
                            <input 
                              type="number" 
                              value={row.tarjeta} 
                              onChange={(e) => updateEntryRow(row.id, 'tarjeta', e.target.value)} 
                              className="flex h-8 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-[11px] text-center font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="p-1">
                            <input 
                              type="number" 
                              value={row.reducciones} 
                              onChange={(e) => updateEntryRow(row.id, 'reducciones', e.target.value)} 
                              className="flex h-8 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-[11px] text-center font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                          </TableCell>
                          <TableCell className={cn(
                            "p-1 text-[11px] text-center font-black border-l",
                            Math.abs(diff) < 0.01 ? "text-emerald-500" : diff > 0.01 ? "text-blue-500" : "text-red-500"
                          )}>
                            {format(diff)}
                          </TableCell>
                          <TableCell className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => deleteEntryRow(row.id)} className="h-7 w-7 text-slate-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white border-2 border-slate-100 shadow-lg rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-slate-900 p-4 text-white flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-sky-400" />
                  <h3 className="font-black uppercase tracking-widest text-sm text-sky-500">Resumen de Cuadre Total Kiosko</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 text-center items-start">
                  <div className="space-y-1 py-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Venta Sistema</p>
                    <p className="text-lg font-black text-slate-900">{format(entryTotals.facturado)}</p>
                  </div>
                  <div className="space-y-1 py-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Efectivo</p>
                    <p className="text-lg font-black text-slate-900">{format(entryTotals.efectivo)}</p>
                  </div>
                  <div className="space-y-1 py-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tarjeta</p>
                    <p className="text-lg font-black text-slate-900">{format(entryTotals.tarjeta)}</p>
                  </div>
                  <div className="space-y-1 py-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reducciones</p>
                    <p className="text-lg font-black text-slate-900">{format(entryTotals.reducciones)}</p>
                  </div>
                  <div className={cn(
                    "rounded-xl border-2 flex flex-col justify-center transition-none py-1 min-h-[52px]",
                    isCuadrado ? "bg-green-50 border-green-100" : 
                    isSobrante ? "bg-blue-50 border-blue-100" : 
                    "bg-red-50 border-red-100"
                  )}>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isCuadrado ? "text-green-600" : isSobrante ? "text-blue-600" : "text-red-600"
                    )}>Diferencia Total</p>
                    <p className={cn(
                      "text-xl font-black leading-tight",
                      isCuadrado ? "text-green-600" : isSobrante ? "text-blue-600" : "text-red-600"
                    )}>{format(entryTotals.diff)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-white/50 p-4 rounded-[1.5rem] border-2 border-slate-200 flex flex-col gap-4 shadow-inner">
              <h3 className="text-center font-black text-[10px] text-slate-400 uppercase tracking-[0.4em]">Certificado de Revisión</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className={cn(
                  "h-16 rounded-[1rem] flex flex-col items-center justify-center border-2 transition-none shadow-sm gap-1",
                  isMounted && isCuadrado ? "bg-emerald-500 border-transparent text-white" : "bg-white border-slate-100 text-slate-200"
                )}>
                  <span className="font-black text-[10px] uppercase tracking-widest">CUADRADO</span>
                  {isMounted && isCuadrado && <Check className="h-4 w-4" strokeWidth={5} />}
                </div>
                <div className={cn(
                  "h-16 rounded-[1rem] flex flex-col items-center justify-center border-2 transition-none shadow-sm gap-1",
                  isMounted && isFaltante ? "bg-red-500 border-transparent text-white" : "bg-white border-slate-100 text-slate-200"
                )}>
                  <span className="font-black text-[10px] uppercase tracking-widest">FALTANTE</span>
                  {isMounted && isFaltante && <Check className="h-4 w-4" strokeWidth={5} />}
                </div>
                <div className={cn(
                  "h-16 rounded-[1rem] flex flex-col items-center justify-center border-2 transition-none shadow-sm gap-1",
                  isMounted && isSobrante ? "bg-blue-500 border-transparent text-white" : "bg-white border-slate-100 text-slate-200"
                )}>
                  <span className="font-black text-[10px] uppercase tracking-widest">SOBRANTE</span>
                  {isMounted && isSobrante && <Check className="h-4 w-4" strokeWidth={5} />}
                </div>
              </div>
            </div>

            <div className="flex justify-center pb-10">
              <KioskoReportDialog 
                entries={entries} 
                unitBrand={unitBrand} 
                unitNumber={unitNumber} 
                storeUnit={storeUnit}
                currencyCode={currency} 
              />
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
