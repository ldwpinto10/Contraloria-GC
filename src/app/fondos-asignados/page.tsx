"use client"

import { useState, useEffect, useMemo, useCallback } from "react";
import { CurrencyCode, CURRENCIES } from "@/types";
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
  Wallet,
  ReceiptText,
  LayoutDashboard,
  Calculator,
  Plus,
  CircleDollarSign,
  ShieldCheck,
  Ticket,
  Coins,
  ArrowRightLeft
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReconciliationReportDialog } from "@/components/petty-cash/ReconciliationReportDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DenominationCalculator } from "@/components/petty-cash/DenominationCalculator";
import { InvoiceCalculator } from "@/components/petty-cash/InvoiceCalculator";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function FondosAsignadosPage() {
  const [currency, setCurrency] = useState<CurrencyCode>('HNL');
  const [unitBrand, setUnitBrand] = useState<string>("");
  const [unitNumber, setUnitNumber] = useState("");
  
  const [authCambio, setAuthCambio] = useState<number>(0);
  const [conteoCambio, setConteoCambio] = useState<number>(0);
  const [facturasCambio, setFacturasCambio] = useState<number>(0);

  const [authCaja, setAuthCaja] = useState<number>(0);
  const [conteoCaja, setConteoCaja] = useState<number>(0);
  const [facturasTotal, setFacturasTotal] = useState<number>(0);
  const [valesTotal, setValesTotal] = useState<number>(0);

  // States for calculator persistence
  const [countsCambio, setCountsCambio] = useState<Record<string, string>>({});
  const [valsFacturasCambio, setValsFacturasCambio] = useState<string[]>(Array(10).fill(""));
  const [countsCaja, setCountsCaja] = useState<Record<string, string>>({});
  const [valsFacturasCaja, setValsFacturasCaja] = useState<string[]>(Array(10).fill(""));
  const [valsVales, setValsVales] = useState<string[]>(Array(10).fill(""));

  const [isMounted, setIsMounted] = useState(false);
  const [activeCalc, setActiveCalc] = useState<'caja' | 'cambio' | 'facturas' | 'facturas_cambio' | 'vales' | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("contraloria_gc_session_data_v4");
      if (saved) {
        const data = JSON.parse(saved);
        setCurrency(data.currency || 'HNL');
        setUnitBrand(data.unitBrand || "");
        setUnitNumber(data.unitNumber || "");
        setAuthCambio(data.authCambio || 0);
        setConteoCambio(data.conteoCambio || 0);
        setFacturasCambio(data.facturasCambio || 0);
        setAuthCaja(data.authCaja || 0);
        setConteoCaja(data.conteoCaja || 0);
        setFacturasTotal(data.facturasTotal || 0);
        setValesTotal(data.valesTotal || 0);
        
        // Load breakdowns
        setCountsCambio(data.countsCambio || {});
        setValsFacturasCambio(data.valsFacturasCambio || Array(10).fill(""));
        setCountsCaja(data.countsCaja || {});
        setValsFacturasCaja(data.valsFacturasCaja || Array(10).fill(""));
        setValsVales(data.valsVales || Array(10).fill(""));
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
      authCambio,
      conteoCambio,
      facturasCambio,
      authCaja,
      conteoCaja,
      facturasTotal,
      valesTotal,
      countsCambio,
      valsFacturasCambio,
      countsCaja,
      valsFacturasCaja,
      valsVales
    };
    localStorage.setItem("contraloria_gc_session_data_v4", JSON.stringify(data));
  }, [currency, unitBrand, unitNumber, authCambio, conteoCambio, facturasCambio, authCaja, conteoCaja, facturasTotal, valesTotal, countsCambio, valsFacturasCambio, countsCaja, valsFacturasCaja, valsVales, isMounted]);

  const currentCurrency = CURRENCIES[currency];

  const format = useCallback((val: number) => {
    return `${currentCurrency.symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [currentCurrency.symbol]);

  const stats = useMemo(() => {
    const totalAuditadoCambio = conteoCambio + facturasCambio;
    const diffCambio = totalAuditadoCambio - authCambio;
    const totalAuditadoCaja = conteoCaja + facturasTotal + valesTotal;
    const diffCaja = totalAuditadoCaja - authCaja;
    return { diffCambio, totalAuditadoCaja, diffCaja, totalAuditadoCambio };
  }, [authCambio, conteoCambio, facturasCambio, authCaja, conteoCaja, facturasTotal, valesTotal]);

  const handleUnitNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) { setUnitNumber(""); return; }
    const num = parseInt(val, 10);
    setUnitNumber(num < 10 ? `0${num}` : num.toString());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <main className="flex-1 container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none whitespace-nowrap">
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
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 flex items-center gap-3 w-fit mx-auto">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">CGC - AUDITORÍA</p>
              <p className="text-xs font-bold text-primary">CUADRE DE FONDOS</p>
            </div>
          </div>

          <div className="bg-blue-50 p-5 rounded-xl shadow-sm border-2 border-blue-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Store className="h-3 w-3" />Marca</Label>
                <Select value={unitBrand} onValueChange={setUnitBrand}>
                  <SelectTrigger className="h-10 font-bold bg-white border-blue-100"><SelectValue placeholder="Seleccione Marca" /></SelectTrigger>
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
                <input type="text" placeholder="Ej. 01" value={unitNumber} onChange={handleUnitNumberChange} className="flex h-10 w-full rounded-md border border-blue-100 bg-white px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CircleDollarSign className="h-3 w-3" />Moneda</Label>
                <Select value={currency} onValueChange={(val: CurrencyCode) => setCurrency(val)}>
                  <SelectTrigger className="h-10 font-bold bg-white border-blue-100"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(CURRENCIES).map((c) => (<SelectItem key={c.code} value={c.code}>{c.symbol} - {c.code}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-slate-100 shadow-lg overflow-hidden rounded-2xl bg-white">
              <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  <h3 className="font-black uppercase tracking-widest text-xs">CUADRE FONDO PARA CAMBIO</h3>
                </div>
                <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase border-2", Math.abs(stats.diffCambio) < 0.01 ? "bg-white/20 border-white" : "bg-red-500 border-white")}>
                  {Math.abs(stats.diffCambio) < 0.01 ? "CUADRADO" : stats.diffCambio > 0 ? "SOBRANTE" : "FALTANTE"}
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fondo asignado para cambio</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-300">{currentCurrency.symbol}</span>
                    <input type="number" step="0.01" value={authCambio || ""} onChange={(e) => setAuthCambio(parseFloat(e.target.value) || 0)} className="h-10 w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-lg font-black text-slate-900 focus:border-slate-900 outline-none transition-colors" placeholder="0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <div className="space-y-2">
                    <div className="flex items-center justify-between"><Label className="text-[9px] font-black text-slate-400 uppercase">Conteo de fondo</Label><button onClick={() => setActiveCalc('cambio')} className="text-slate-600"><Calculator className="h-3 w-3" /></button></div>
                    <input type="number" value={conteoCambio || ""} onChange={(e) => setConteoCambio(parseFloat(e.target.value) || 0)} className="h-9 w-full rounded-lg border border-slate-200 bg-white text-center font-black text-sm" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><Label className="text-[9px] font-black text-slate-400 uppercase">Factura Clientes</Label><button onClick={() => setActiveCalc('facturas_cambio')} className="text-slate-600"><Plus className="h-3 w-3" /></button></div>
                    <input type="number" value={facturasCambio || ""} onChange={(e) => setFacturasCambio(parseFloat(e.target.value) || 0)} className="h-9 w-full rounded-lg border border-slate-200 bg-white text-center font-black text-sm" placeholder="0.00" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-400 uppercase">Total Auditado:</p>
                   <p className="text-lg font-black text-slate-900">{format(stats.totalAuditadoCambio)}</p>
                </div>

                <div className={cn("p-4 rounded-xl border-2 text-center space-y-1", Math.abs(stats.diffCambio) < 0.01 ? "bg-emerald-50 border-emerald-100" : stats.diffCambio > 0 ? "bg-blue-50 border-blue-100" : "bg-red-50 border-red-100")}>
                  <p className="text-[9px] font-black uppercase opacity-60">Diferencia de Cambio</p>
                  <p className="text-2xl font-black">{format(stats.diffCambio)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 shadow-lg overflow-hidden rounded-2xl bg-white">
              <div className="bg-blue-700 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  <h3 className="font-black uppercase tracking-widest text-xs">CUADRE FONDO CAJA CHICA</h3>
                </div>
                <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase border-2", Math.abs(stats.diffCaja) < 0.01 ? "bg-white/20 border-white" : "bg-red-500 border-white")}>
                  {Math.abs(stats.diffCaja) < 0.01 ? "CUADRADO" : stats.diffCaja > 0 ? "SOBRANTE" : "FALTANTE"}
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Autorizado Caja Chica</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-300">{currentCurrency.symbol}</span>
                    <input type="number" step="0.01" value={authCaja || ""} onChange={(e) => setAuthCaja(parseFloat(e.target.value) || 0)} className="h-10 w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-lg font-black text-slate-900 focus:border-blue-500 outline-none" placeholder="0.00" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                   <div className="space-y-2">
                    <div className="flex items-center justify-between"><Label className="text-[9px] font-black text-slate-400 uppercase">Efectivo</Label><button onClick={() => setActiveCalc('caja')} className="text-blue-600"><Calculator className="h-3 w-3" /></button></div>
                    <input type="number" value={conteoCaja || ""} onChange={(e) => setConteoCaja(parseFloat(e.target.value) || 0)} className="h-9 w-full rounded-lg border border-slate-200 bg-white text-center font-black text-sm" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><Label className="text-[9px] font-black text-slate-400 uppercase">Factura Reembolsos</Label><button onClick={() => setActiveCalc('facturas')} className="text-blue-600"><Plus className="h-3 w-3" /></button></div>
                    <input type="number" value={facturasTotal || ""} onChange={(e) => setFacturasTotal(parseFloat(e.target.value) || 0)} className="h-9 w-full rounded-lg border border-slate-200 bg-white text-center font-black text-sm" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><Label className="text-[9px] font-black text-slate-400 uppercase">Vales</Label><button onClick={() => setActiveCalc('vales')} className="text-blue-600"><Plus className="h-3 w-3" /></button></div>
                    <input type="number" value={valesTotal || ""} onChange={(e) => setValesTotal(parseFloat(e.target.value) || 0)} className="h-9 w-full rounded-lg border border-slate-200 bg-white text-center font-black text-sm" placeholder="0.00" />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-400 uppercase">Total Auditado:</p>
                   <p className="text-lg font-black text-blue-700">{format(stats.totalAuditadoCaja)}</p>
                </div>
                <div className={cn("p-4 rounded-xl border-2 text-center space-y-1", Math.abs(stats.diffCaja) < 0.01 ? "bg-emerald-50 border-emerald-100" : stats.diffCaja > 0 ? "bg-blue-50 border-blue-100" : "bg-red-50 border-red-100")}>
                  <p className="text-[9px] font-black uppercase opacity-60">Diferencia de Caja Chica</p>
                  <p className="text-2xl font-black">{format(stats.diffCaja)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-8">
            <ReconciliationReportDialog 
              authCambio={authCambio}
              conteoCambio={conteoCambio}
              facturasCambio={facturasCambio}
              authCaja={authCaja}
              conteoCaja={conteoCaja}
              facturasTotal={facturasTotal}
              valesTotal={valesTotal}
              currencyCode={currency}
              unitBrand={unitBrand}
              unitNumber={unitNumber}
            />
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] mt-auto">
        <p>2026 CONTRALORÍA GRUPO COMIDAS • CGC SISTEMA DE CONTROLES OPERATIVOS. LP</p>
      </footer>

      <Dialog open={activeCalc !== null} onOpenChange={() => setActiveCalc(null)}>
        <DialogContent className="max-w-xs p-4 overflow-hidden rounded-2xl bg-white">
          <DialogHeader className="mb-2">
            <DialogTitle className="font-black uppercase text-xs flex items-center gap-2 text-slate-500">
              {activeCalc === 'facturas' || activeCalc === 'facturas_cambio' || activeCalc === 'vales' ? (
                <>
                  {(activeCalc === 'facturas' || activeCalc === 'facturas_cambio') ? <ReceiptText className="h-3.5 w-3.5 text-purple-600" /> : <Ticket className="h-3.5 w-3.5 text-sky-600" />}
                  {activeCalc === 'facturas_cambio' ? 'Detalle Factura Clientes' : 
                   activeCalc === 'facturas' ? 'Detalle Factura Reembolsos' : 'Detalle de Vales'}
                </>
              ) : (
                <><Calculator className="h-3.5 w-3.5 text-primary" /> Desglose de Efectivo</>
              )}
            </DialogTitle>
          </DialogHeader>
          {activeCalc === 'facturas' || activeCalc === 'facturas_cambio' || activeCalc === 'vales' ? (
            <InvoiceCalculator 
              onConfirm={(total, values) => {
                if (activeCalc === 'facturas') { setFacturasTotal(total); setValsFacturasCaja(values); }
                if (activeCalc === 'facturas_cambio') { setFacturasCambio(total); setValsFacturasCambio(values); }
                if (activeCalc === 'vales') { setValesTotal(total); setValsVales(values); }
                setActiveCalc(null);
              }} 
              onCancel={() => setActiveCalc(null)} 
              currencyCode={currency} 
              color={(activeCalc === 'facturas' || activeCalc === 'facturas_cambio') ? 'purple' : 'sky'} 
              initialValues={
                activeCalc === 'facturas' ? valsFacturasCaja :
                activeCalc === 'facturas_cambio' ? valsFacturasCambio :
                valsVales
              }
            />
          ) : (
            <DenominationCalculator 
              onConfirm={(total, counts) => {
                if (activeCalc === 'caja') { setConteoCaja(total); setCountsCaja(counts); }
                if (activeCalc === 'cambio') { setConteoCambio(total); setCountsCambio(counts); }
                setActiveCalc(null);
              }} 
              onCancel={() => setActiveCalc(null)} 
              currencyCode={currency} 
              initialCounts={activeCalc === 'caja' ? countsCaja : countsCambio}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
