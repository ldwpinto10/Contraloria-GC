'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  FileCheck,
  Loader2,
  Image as ImageIcon,
  X,
  Check,
  Banknote,
  Wallet,
  ReceiptText,
  CircleDollarSign,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { CurrencyCode, CURRENCIES } from '@/types';
import { cn } from '@/lib/utils';
import { toJpeg } from 'html-to-image';

interface ReconciliationReportDialogProps {
  authCambio: number;
  conteoCambio: number;
  facturasCambio?: number;
  authCaja: number;
  conteoCaja: number;
  facturasTotal: number;
  valesTotal: number;
  currencyCode: CurrencyCode;
  unitBrand?: string;
  unitNumber?: string;
}

export function ReconciliationReportDialog({
  authCambio = 0,
  conteoCambio = 0,
  facturasCambio = 0,
  authCaja = 0,
  conteoCaja = 0,
  facturasTotal = 0,
  valesTotal = 0,
  currencyCode,
  unitBrand = '',
  unitNumber = '',
}: ReconciliationReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.2);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const REPORT_WIDTH = 1150;

  useEffect(() => {
    const updateScale = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const dialogWidth = Math.min(width * 0.95, 1200);
        const scale = dialogWidth / REPORT_WIDTH;
        setPreviewScale(scale);
      }
    };
    if (isOpen) {
      updateScale();
      window.addEventListener('resize', updateScale);
    }
    return () => window.removeEventListener('resize', updateScale);
  }, [isOpen]);

  const currency = CURRENCIES[currencyCode];

  const safeNum = (val: any): number => {
    if (val === null || val === undefined) return 0;
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]/g, '')) : val;
    return isFinite(num) ? num : 0;
  };

  const format = (val: number) => {
    const v = safeNum(val);
    const formatted = Math.abs(v).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${v < -0.001 ? '-' : ''}${currency.symbol}${formatted}`;
  };

  const totalAuditadoCambio = safeNum(conteoCambio) + safeNum(facturasCambio);
  const diffCambio = totalAuditadoCambio - safeNum(authCambio);
  
  const totalAuditadoCaja = safeNum(conteoCaja) + safeNum(facturasTotal) + safeNum(valesTotal);
  const diffCaja = totalAuditadoCaja - safeNum(authCaja);
  
  const totalDiff = diffCambio + diffCaja;

  const isGlobalCuadrado = Math.abs(totalDiff) < 0.01;
  const isGlobalFaltante = totalDiff <= -0.01;
  const isGlobalSobrante = totalDiff >= 0.01;

  const hasCambioValues = safeNum(authCambio) !== 0 || safeNum(conteoCambio) !== 0 || safeNum(facturasCambio) !== 0;
  const hasCajaValues = safeNum(authCaja) !== 0 || safeNum(conteoCaja) !== 0 || safeNum(facturasTotal) !== 0 || safeNum(valesTotal) !== 0;

  const handleSaveImage = async () => {
    if (reportRef.current === null) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const node = reportRef.current;
      const dataUrl = await toJpeg(node, {
        quality: 1,
        backgroundColor: '#ffffff',
        width: REPORT_WIDTH,
        pixelRatio: 4,
        skipFonts: true,
      });

      localStorage.setItem('contraloria_gc_session_data_v3_reported', 'true');

      const link = document.createElement('a');
      link.download = `REPORTE-FONDOS-${unitBrand}-${unitNumber}.jpg`;
      link.href = dataUrl;
      link.click();
      setIsOpen(false);
    } catch (err) {
      console.error('Error al exportar imagen:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-14 font-black gap-3 text-lg shadow-xl hover:scale-[1.01] transition-transform uppercase bg-[#2465D6] hover:bg-blue-700 text-white border-none">
            <FileCheck className="h-6 w-6" />
            GENERAR REPORTE
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[98vw] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col h-[95vh]">
          <DialogHeader className="p-3 bg-[#0f172a] text-white shrink-0 no-print flex flex-row items-center justify-between space-y-0 border-b border-white/10">
            <DialogTitle className="font-bold uppercase tracking-[0.15em] text-[10px]">
              Vista Previa Cuadre de Fondos
            </DialogTitle>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
          </DialogHeader>

          <div className="bg-slate-100 no-print overflow-y-auto flex-1 p-4 flex justify-center items-start">
            <div className="relative origin-top transform" style={{ width: `${REPORT_WIDTH}px`, scale: previewScale }}>
              <div
                ref={reportRef}
                className="bg-white text-slate-900 flex flex-col font-sans overflow-hidden border-2 border-slate-900"
                style={{ width: `${REPORT_WIDTH}px`, height: 'auto' }}
              >
                <div className="bg-[#0f172a] text-white py-10 flex flex-col items-center gap-4 shrink-0">
                  <ShieldCheck className="h-12 w-12 text-primary" strokeWidth={1.5} />
                  <h1 className="font-black uppercase tracking-tight text-3xl text-center leading-tight">
                    REPORTE DE AUDITORÍA DE FONDOS
                  </h1>
                  <div className="inline-flex items-center justify-center min-w-[280px] py-2 rounded-full bg-white/10 border border-white/20 px-6">
                    <span className="font-black text-2xl uppercase tracking-[0.2em] text-white">
                      {unitBrand.toUpperCase()} #{unitNumber || '00'}
                    </span>
                  </div>
                </div>

                <div className="px-10 py-8 space-y-8 flex-1 flex flex-col pb-12">
                  
                  {hasCambioValues && (
                    <div className="space-y-3">
                      <div className="bg-slate-900 px-6 py-2 rounded-t-[1rem] flex items-center gap-3 border-2 border-slate-900 border-b-0">
                        <Wallet className="h-5 w-5 text-white" />
                        <span className="font-black uppercase tracking-[0.15em] text-lg text-white">CUADRE FONDO PARA CAMBIO</span>
                      </div>
                      <div className="bg-white border-2 border-slate-900 rounded-b-[1rem] shadow-xl overflow-hidden">
                        <table className="w-full border-collapse">
                          <tbody className="divide-y divide-slate-100">
                            <tr className="bg-white">
                              <td className="pl-6 py-4 text-base font-black text-slate-500 uppercase tracking-widest">Fondo Autorizado</td>
                              <td className="pr-6 py-4 text-2xl font-black text-right tabular-nums text-slate-900">{format(authCambio)}</td>
                            </tr>
                            {safeNum(conteoCambio) !== 0 && (
                              <tr className="bg-slate-50/50">
                                <td className="pl-6 py-3 text-sm font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Banknote className="h-4 w-4" /> Conteo de fondo</td>
                                <td className="pr-6 py-3 text-xl font-bold text-right tabular-nums text-slate-800">{format(conteoCambio)}</td>
                              </tr>
                            )}
                            {safeNum(facturasCambio) !== 0 && (
                              <tr className="bg-white">
                                <td className="pl-6 py-3 text-sm font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><ReceiptText className="h-4 w-4 text-purple-600" /> Factura Clientes</td>
                                <td className="pr-6 py-3 text-xl font-bold text-right tabular-nums text-slate-800">{format(facturasCambio)}</td>
                              </tr>
                            )}
                            <tr className="bg-slate-100">
                              <td className="pl-6 py-3 text-base font-black text-slate-700 uppercase tracking-widest">Total Auditado Cambio</td>
                              <td className="pr-6 py-3 text-2xl font-black text-right tabular-nums text-slate-900">{format(totalAuditadoCambio)}</td>
                            </tr>
                            <tr className={cn(
                              "border-t-2 border-slate-900",
                              Math.abs(diffCambio) < 0.01 ? "bg-emerald-500 text-white" : "bg-red-600 text-white"
                            )}>
                              <td className="pl-6 py-4 text-xl font-black uppercase tracking-widest">DIFERENCIA CAMBIO</td>
                              <td className="pr-6 py-4 text-3xl font-black text-right tabular-nums">{format(diffCambio)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {hasCajaValues && (
                    <div className="space-y-3">
                      <div className="bg-[#2465D6] px-6 py-2 rounded-t-[1rem] flex items-center gap-3 border-2 border-slate-900 border-b-0">
                        <Coins className="h-5 w-5 text-white" />
                        <span className="font-black uppercase tracking-[0.15em] text-lg text-white">CUADRE FONDO CAJA CHICA</span>
                      </div>
                      <div className="bg-white border-2 border-slate-900 rounded-b-[1rem] shadow-xl overflow-hidden">
                        <table className="w-full border-collapse">
                          <tbody className="divide-y divide-slate-100">
                            <tr className="bg-white">
                              <td className="pl-6 py-4 text-base font-black text-slate-500 uppercase tracking-widest">Fondo Autorizado Caja Chica</td>
                              <td className="pr-6 py-4 text-2xl font-black text-right tabular-nums text-slate-900">{format(authCaja)}</td>
                            </tr>
                            {safeNum(conteoCaja) !== 0 && (
                              <tr className="bg-slate-50/50">
                                <td className="pl-6 py-3 text-sm font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Banknote className="h-4 w-4" /> Efectivo Físico</td>
                                <td className="pr-6 py-3 text-xl font-bold text-right tabular-nums text-slate-800">{format(conteoCaja)}</td>
                              </tr>
                            )}
                            {safeNum(facturasTotal) !== 0 && (
                              <tr className="bg-white">
                                <td className="pl-6 py-3 text-sm font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><ReceiptText className="h-4 w-4 text-purple-600" /> Factura Reembolsos</td>
                                <td className="pr-6 py-3 text-xl font-bold text-right tabular-nums text-slate-800">{format(facturasTotal)}</td>
                              </tr>
                            )}
                            {safeNum(valesTotal) !== 0 && (
                              <tr className="bg-slate-50/50">
                                <td className="pl-6 py-3 text-sm font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><CircleDollarSign className="h-4 w-4 text-sky-600" /> Vales de Caja</td>
                                <td className="pr-6 py-3 text-xl font-bold text-right tabular-nums text-slate-800">{format(valesTotal)}</td>
                              </tr>
                            )}
                            <tr className="bg-slate-100">
                              <td className="pl-6 py-3 text-base font-black text-blue-700 uppercase tracking-widest">Total Auditado Caja</td>
                              <td className="pr-6 py-3 text-2xl font-black text-right tabular-nums text-blue-700">{format(totalAuditadoCaja)}</td>
                            </tr>
                            <tr className={cn(
                              "border-t-2 border-slate-900",
                              Math.abs(diffCaja) < 0.01 ? "bg-emerald-500 text-white" : "bg-red-600 text-white"
                            )}>
                              <td className="pl-6 py-4 text-xl font-black uppercase tracking-widest">DIFERENCIA CAJA CHICA</td>
                              <td className="pr-6 py-4 text-3xl font-black text-right tabular-nums">{format(diffCaja)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className={cn(
                    "grid gap-4",
                    (hasCambioValues && hasCajaValues) ? "grid-cols-3" : "grid-cols-2"
                  )}>
                    {hasCambioValues && (
                      <div className="bg-slate-900 p-4 rounded-[1rem] shadow-xl text-center border-2 border-white/10 flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">DIF. CAMBIO</p>
                        <p className={cn(
                          "text-xl font-black tabular-nums",
                          Math.abs(diffCambio) < 0.01 ? "text-emerald-400" : diffCambio > 0 ? "text-blue-400" : "text-red-400"
                        )}>{format(diffCambio)}</p>
                      </div>
                    )}
                    {hasCajaValues && (
                      <div className="bg-slate-900 p-4 rounded-[1rem] shadow-xl text-center border-2 border-white/10 flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">DIF. CAJA CHICA</p>
                        <p className={cn(
                          "text-xl font-black tabular-nums",
                          Math.abs(diffCaja) < 0.01 ? "text-emerald-400" : diffCaja > 0 ? "text-blue-400" : "text-red-400"
                        )}>{format(diffCaja)}</p>
                      </div>
                    )}
                    <div className="bg-slate-100 p-4 rounded-[1rem] shadow-xl text-center border-2 border-slate-900 flex flex-col justify-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">DIFERENCIA TOTAL</p>
                      <div className={cn(
                        "text-2xl font-black tabular-nums",
                        Math.abs(totalDiff) < 0.01 ? "text-emerald-600" : totalDiff > 0 ? "text-blue-600" : "text-red-600"
                      )}>
                        {format(totalDiff)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-200 flex flex-col gap-4 shrink-0 shadow-inner mt-4">
                    <h3 className="text-center font-black text-xs text-slate-400 uppercase tracking-[0.4em]">CERTIFICADO DE REVISIÓN FINAL</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className={cn(
                        "h-28 rounded-[1rem] flex flex-col items-center justify-center border-2 transition-all shadow-lg gap-1",
                        isGlobalCuadrado ? "bg-emerald-500 border-transparent text-white scale-105" : "bg-white border-slate-100 text-slate-200"
                      )}>
                        <span className="font-black text-xl uppercase tracking-widest">CUADRADO</span>
                        {isGlobalCuadrado && <Check className="h-6 w-6" strokeWidth={5} />}
                      </div>
                      <div className={cn(
                        "h-28 rounded-[1rem] flex flex-col items-center justify-center border-2 transition-all shadow-lg gap-1",
                        isGlobalFaltante ? "bg-red-500 border-transparent text-white scale-105" : "bg-white border-slate-100 text-slate-200"
                      )}>
                        <span className="font-black text-xl uppercase tracking-widest">FALTANTE</span>
                        {isGlobalFaltante && <Check className="h-6 w-6" strokeWidth={5} />}
                      </div>
                      <div className={cn(
                        "h-28 rounded-[1rem] flex flex-col items-center justify-center border-2 transition-all shadow-lg gap-1",
                        isGlobalSobrante ? "bg-blue-500 border-transparent text-white scale-105" : "bg-white border-slate-100 text-slate-200"
                      )}>
                        <span className="font-black text-xl uppercase tracking-widest">SOBRANTE</span>
                        {isGlobalSobrante && <Check className="h-6 w-6" strokeWidth={5} />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-white border-t flex flex-row gap-3 justify-center items-center no-print shrink-0">
            <Button onClick={handleSaveImage} disabled={isExporting} className="w-full gap-2 font-black bg-[#0f172a] h-14 text-xl uppercase shadow-md hover:bg-slate-800 transition-all text-white border-none">
              {isExporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
              GENERAR REPORTE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
